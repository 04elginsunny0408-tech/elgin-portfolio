const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/portfolio.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

for (const t of tables) {
  const rows = db.prepare(`SELECT * FROM ${t.name}`).all();
  console.log(`\nTable ${t.name} (${rows.length} rows):`);
  console.log(rows);
}
