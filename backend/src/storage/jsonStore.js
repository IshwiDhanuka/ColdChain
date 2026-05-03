const fs = require('fs/promises');
const path = require('path');

const dataDir = path.resolve(
  process.env.JSON_DATA_DIR || path.join(__dirname, '../../data')
);

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

function resolveStorePath(fileName) {
  return path.join(dataDir, fileName);
}

async function readJsonArray(fileName) {
  await ensureDataDir();
  const filePath = resolveStorePath(fileName);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJsonArray(fileName, rows) {
  await ensureDataDir();
  const filePath = resolveStorePath(fileName);
  const tempPath = `${filePath}.tmp`;

  await fs.writeFile(tempPath, JSON.stringify(rows, null, 2));
  await fs.rename(tempPath, filePath);
}

async function appendJsonRecord(fileName, record) {
  const rows = await readJsonArray(fileName);
  rows.push(record);
  await writeJsonArray(fileName, rows);
  return record;
}

module.exports = {
  appendJsonRecord,
  readJsonArray,
  writeJsonArray,
};
