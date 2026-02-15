let criteria = [];
let options = [];

function addCriterion() {
  const id = Date.now();

  criteria.push({ id });

  const container = document.getElementById("criteriaList");

  const div = document.createElement("div");
  div.innerHTML = `
    <input placeholder="Name" id="c-name-${id}">
    <input type="number" placeholder="Weight" id="c-weight-${id}">
    <select id="c-type-${id}">
      <option value="benefit">Benefit</option>
      <option value="cost">Cost</option>
    </select>
  `;

  container.appendChild(div);
}

function addOption() {
  const id = Date.now();

  options.push({ id });

  const container = document.getElementById("optionsList");

  const div = document.createElement("div");
  div.innerHTML = `
    <input placeholder="Option Name" id="o-name-${id}">
  `;

  container.appendChild(div);

  renderMatrix();
}

function renderMatrix() {
  const matrixContainer = document.getElementById("matrixContainer");

  matrixContainer.innerHTML = "";

  if (criteria.length === 0 || options.length === 0) return;

  let table = "<table><tr><th>Option</th>";

  criteria.forEach(c => {
    table += `<th>${document.getElementById(`c-name-${c.id}`)?.value || "Criterion"}</th>`;
  });

  table += "</tr>";

  options.forEach(o => {
    table += `<tr><td>${document.getElementById(`o-name-${o.id}`)?.value || "Option"}</td>`;

    criteria.forEach(c => {
      table += `<td><input type="number" id="value-${o.id}-${c.id}"></td>`;
    });

    table += "</tr>";
  });

  table += "</table>";

  matrixContainer.innerHTML = table;
}

async function evaluateDecision() {

  const decisionName = document.getElementById("decisionName").value;

  const structuredCriteria = criteria.map(c => ({
    name: document.getElementById(`c-name-${c.id}`).value,
    weight: parseFloat(document.getElementById(`c-weight-${c.id}`).value),
    type: document.getElementById(`c-type-${c.id}`).value
  }));

  const structuredOptions = options.map(o => {
    const values = {};

    criteria.forEach(c => {
      const val = document.getElementById(`value-${o.id}-${c.id}`).value;
      values[document.getElementById(`c-name-${c.id}`).value] = parseFloat(val);
    });

    return {
      name: document.getElementById(`o-name-${o.id}`).value,
      values
    };
  });

  const response = await fetch("/api/decision/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: decisionName,
      criteria: structuredCriteria,
      options: structuredOptions
    })
  });

  const data = await response.json();
console.log("SERVER RESPONSE:", data);

  renderResults(data);
}


function renderResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  // 🔴 Handle error response
  if (!data || data.error) {
    resultsDiv.innerHTML = `<p style="color:red;">
      ${data?.error || "Unexpected server error"}
    </p>`;
    return;
  }

  // 🔴 Ensure ranking exists
  if (!data.ranking || !Array.isArray(data.ranking)) {
    resultsDiv.innerHTML = `<p style="color:red;">
      Invalid response from server
    </p>`;
    console.log("Server response:", data);
    return;
  }

  data.ranking.forEach((item, index) => {
    let html = `<h3>${index + 1}. ${item.optionName} (Score: ${item.totalScore.toFixed(3)})</h3>`;
    html += "<ul>";

    item.breakdown.forEach(b => {
      html += `<li>
        ${b.criterion} →
        normalized: ${b.normalized.toFixed(3)},
        weight: ${b.weight},
        contribution: ${b.contribution.toFixed(3)}
      </li>`;
    });

    html += "</ul>";

    resultsDiv.innerHTML += html;
  });
}

