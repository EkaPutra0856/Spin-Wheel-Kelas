import { read, utils } from 'xlsx';
import { readFileSync } from 'fs';

const buffer = readFileSync('data/PEMBAGIAN-MURID-TP-2026-2027-e0dd62.xlsx');
const workbook = read(buffer, { cellDates: true });

console.log('Sheet names:', workbook.SheetNames);

workbook.SheetNames.forEach(name => {
  console.log(`\n=== Sheet: ${name} ===`);
  const sheet = workbook.Sheets[name];
  const data = utils.sheet_to_json(sheet);
  console.log(JSON.stringify(data.slice(0, 30), null, 2));
});
