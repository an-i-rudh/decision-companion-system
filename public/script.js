let criteria = [];
let options = [];

function addCriterion() {
  const id = Date.now();
  criteria.push({ id });
  const container = document.getElementById("criteriaList");
  const div = document.createElement("div");
  div.id = `c-row-${id}`;
  div.className = "input-group";
  // Inside script.js -> function addCriterion()
  div.innerHTML = `
    <input placeholder="Name" id="c-name-${id}" oninput="renderMatrix()">
    <input type="number" 
          placeholder="Wght" 
          id="c-weight-${id}" 
          style="width:60px" 
          min="1" 
          max="10" 
          value="5">
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

  // 1. Validate Criteria and Weights
  if (criteria.length === 0 || options.length === 0) {
    resultsDiv.innerHTML = `<p style="color:orange">Please add at least one criterion and one option.</p>`;
    return;
  }

  const structuredCriteria = [];
  for (const c of criteria) {
    const nameInput = document.getElementById(`c-name-${c.id}`);
    const weightInput = document.getElementById(`c-weight-${c.id}`);
    const typeInput = document.getElementById(`c-type-${c.id}`);
    
    const weight = parseFloat(weightInput.value);

    // Validation for weight between 1 and 10
    if (isNaN(weight) || weight < 1 || weight > 10) {
      alert(`Weight for "${nameInput.value || 'Criterion'}" must be between 1 and 10.`);
      weightInput.focus();
      return; // Stop execution if validation fails
    }

    structuredCriteria.push({
      name: nameInput.value || "Unnamed",
      weight: weight,
      type: typeInput.value
    });
  }

  // 2. Structure Options Data
  const structuredOptions = options.map(o => {
    const values = {};
    criteria.forEach(c => {
      const critName = document.getElementById(`c-name-${c.id}`).value || "Unnamed";
      const val = document.getElementById(`value-${o.id}-${c.id}`).value;
      values[critName] = parseFloat(val) || 0;
    });
    return { 
      name: document.getElementById(`o-name-${o.id}`).value || "Unnamed", 
      values 
    };
  });

  // 3. Send to Server
  resultsDiv.innerHTML = "Evaluating...";

  try {
    const response = await fetch("/api/decision/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("decisionName").value || "New Decision",
        criteria: structuredCriteria,
        options: structuredOptions
      })
    });

    if (!response.ok) throw new Error("Server responded with an error.");

    const data = await response.json();
    renderResults(data);
  } catch (err) {
    console.error("Evaluation Error:", err);
    resultsDiv.innerHTML = `<p style="color:red">Error connecting to server. Please ensure the backend is running.</p>`;
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
    const safeScore = Number(item.totalScore);
    let breakdownHtml = `<div class="breakdown"><h4>Explanation:</h4><ul>`;
    item.breakdown.forEach(b => {
      breakdownHtml += `<li><strong>${b.criterion}</strong>: ${b.contribution.toFixed(3)}</li>`;
    });
    breakdownHtml += `</ul></div>`;

    const insightHtml = item.insight ? `<p class="insight">💡 ${item.insight}</p>` : "";

    resultsDiv.innerHTML += `
      <div class="result-card ${index === 0 ? "winner" : ""}">
        <div class="result-card-content">
          <h3>#${index + 1} ${item.optionName}</h3>
          <p>Score: <strong>${safeScore.toFixed(3)}</strong></p>
          ${index === 0 ? insightHtml : ""}
          ${breakdownHtml}
        </div>
      </div>
    `;
  });
}
