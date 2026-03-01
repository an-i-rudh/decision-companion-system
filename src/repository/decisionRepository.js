const db = require('./db');

function createDecision(name) {
    const stmt = db.prepare(`
        INSERT INTO decisions (name, created_at)
        VALUES (?, ?)
    `);

    const result = stmt.run(name, new Date().toISOString());
    return result.lastInsertRowid;
}

function insertOptions(decisionId, options) {
    const stmt = db.prepare(`
        INSERT INTO options (decision_id, name)
        VALUES (?, ?)
    `);

    const optionIds = [];

    const insertMany = db.transaction((opts) => {
        for (const opt of opts) {
            const result = stmt.run(decisionId, opt.name);
            optionIds.push(result.lastInsertRowid);
        }
    });

    insertMany(options);

    return optionIds;
}

function insertCriteria(decisionId, criteria) {
    const stmt = db.prepare(`
        INSERT INTO criteria (decision_id, name, weight, type)
        VALUES (?, ?, ?, ?)
    `);

    const criterionIds = [];

    const insertMany = db.transaction((crits) => {
        for (const c of crits) {
            const result = stmt.run(decisionId, c.name, c.weight, c.type);
            criterionIds.push(result.lastInsertRowid);
        }
    });

    insertMany(criteria);

    return criterionIds;
}

function insertOptionValues(optionIds, criterionIds, valuesMatrix) {
    const stmt = db.prepare(`
        INSERT INTO option_values (option_id, criterion_id, value)
        VALUES (?, ?, ?)
    `);

    const insertMany = db.transaction(() => {
        for (let i = 0; i < optionIds.length; i++) {
            for (let j = 0; j < criterionIds.length; j++) {
                stmt.run(optionIds[i], criterionIds[j], valuesMatrix[i][j]);
            }
        }
    });

    insertMany();
}

module.exports = {
    createDecision,
    insertOptions,
    insertCriteria,
    insertOptionValues,
};
