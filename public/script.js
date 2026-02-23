let criteria = [];
let options = [];

function addCriterion() {
  const id = Date.now();
  criteria.push({ id });

  const container = document.getElementById("criteriaList");
  const div = document.createElement("div");
  div.id = `c-row-${id}`;
  div.className = "input-group";
  div.innerHTML = `
    <input placeholder="Name" id="c-name-${id}" oninput="renderMatrix()">
    <input type="number" placeholder="Wght" id="c-weight-${id}" style="width:60px">
    <select id="c-type-${id}">
      <option value="benefit">Gain</option>
      <option value="cost">Cost</option>
    </select>
    <button class="btn-remove" onclick="removeCriterion(${id})">×</button>
  `;
  container.appendChild(div);
}

function removeCriterion(id) {
  criteria = criteria.filter(c => c.id !== id);
  document.getElementById(`c-row-${id}`).remove();
  renderMatrix();
}

function addOption() {
  const id = Date.now();
  options.push({ id });

  const container = document.getElementById("optionsList");
  const div = document.createElement("div");
  div.id = `o-row-${id}`;
  div.className = "input-group";
  div.innerHTML = `
    <input placeholder="Option Name" id="o-name-${id}" oninput="renderMatrix()">
    <button class="btn-remove" onclick="removeOption(${id})">×</button>
  `;
  container.appendChild(div);
  renderMatrix();
}

function removeOption(id) {
  options = options.filter(o => o.id !== id);
  document.getElementById(`o-row-${id}`).remove();
  renderMatrix();
}

function renderMatrix() {
  const container = document.getElementById("matrixContainer");
  container.innerHTML = "";
  if (criteria.length === 0 || options.length === 0) return;

  let table = "<table><tr><th>Option</th>";
  criteria.forEach(c => {
    const name = document.getElementById(`c-name-${c.id}`)?.value || "Criterion";
    table += `<th>${name}</th>`;
  });
  table += "</tr>";

  options.forEach(o => {
    const name = document.getElementById(`o-name-${o.id}`)?.value || "Option";
    table += `<tr><td><strong>${name}</strong></td>`;
    criteria.forEach(c => {
      table += `<td><input type="number" id="value-${o.id}-${c.id}" placeholder="0"></td>`;
    });
    table += "</tr>";
  });
  table += "</table>";
  container.innerHTML = table;
}

async function evaluateDecision() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "Evaluating...";

  const structuredCriteria = criteria.map(c => ({
    name: document.getElementById(`c-name-${c.id}`).value || "Unnamed",
    weight: parseFloat(document.getElementById(`c-weight-${c.id}`).value) || 1,
    type: document.getElementById(`c-type-${c.id}`).value
  }));

  const structuredOptions = options.map(o => {
    const values = {};
    criteria.forEach(c => {
      const val = document.getElementById(`value-${o.id}-${c.id}`).value;
      values[document.getElementById(`c-name-${c.id}`).value] = parseFloat(val) || 0;
    });
    return { name: document.getElementById(`o-name-${o.id}`).value || "Unnamed", values };
  });

  try {
    const response = await fetch("/api/decision/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("decisionName").value,
        criteria: structuredCriteria,
        options: structuredOptions
      })
    });
    const data = await response.json();
    renderResults(data);
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red">Error connecting to server.</p>`;
  }
}

function renderResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!data || data.error || !data.ranking) {
    resultsDiv.innerHTML = `<p style="color:red">${data?.error || "Invalid response"}</p>`;
    return;
  }

  data.ranking.forEach((item, index) => {
    let html = `<div class="result-card">
      <h3>#${index + 1} ${item.optionName}</h3>
      <p>Score: <strong>${item.totalScore.toFixed(3)}</strong></p>
    </div>`;
    resultsDiv.innerHTML += html;
  });
}
