import { read, utils } from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const buffer = readFileSync('data/PEMBAGIAN-MURID-TP-2026-2027-e0dd62.xlsx');
const workbook = read(buffer, { cellDates: true });

const classesData = {};

// Parse the "Jumlah" sheet to get class names and teacher info
const jumlahSheet = workbook.Sheets['Jumlah'];
const jumlahData = utils.sheet_to_json(jumlahSheet);

const classMetadata = {};
jumlahData.forEach(row => {
  if (row.KELAS && row['NAMA KELAS']) {
    classMetadata[row.KELAS] = {
      namaKelas: row['NAMA KELAS'],
      guruKelas: row['GURU KELAS'] || '',
      jumlah: row['JUMLAH '] || 0
    };
  }
});

// Parse student data from each class sheet
const parseStudentSheet = (sheetName) => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return {};

  const data = utils.sheet_to_json(sheet);
  const students = {};

  // Determine class columns based on the sheet name
  const classColumns = {
    'KELAS 1': {
      '1A': { noCol: 'KELAS 1A (Ms Hani)', nameCol: '__EMPTY', genderCol: '__EMPTY_1' },
      '1B': { noCol: 'KELAS 1B (Ms Opi)', nameCol: '__EMPTY_5', genderCol: '__EMPTY_6' },
      '1C': { noCol: 'KELAS 1C (Ms Azizah)', nameCol: '__EMPTY_10', genderCol: '__EMPTY_11' },
      '1D': { noCol: 'KELAS 1D (Ms Rina)', nameCol: '__EMPTY_15', genderCol: '__EMPTY_16' }
    },
    'KELAS 2': {
      '2A': { noCol: 'KELAS 2A', nameCol: '__EMPTY', genderCol: '__EMPTY_1' },
      '2B': { noCol: 'KELAS 2B', nameCol: '__EMPTY_5', genderCol: '__EMPTY_6' },
      '2C': { noCol: 'KELAS 2C', nameCol: '__EMPTY_10', genderCol: '__EMPTY_11' },
      '2D': { noCol: 'KELAS 2D', nameCol: '__EMPTY_15', genderCol: '__EMPTY_16' }
    },
    'KELAS 3': {
      '3A': { noCol: 'KELAS 3A', nameCol: '__EMPTY', genderCol: '__EMPTY_1' },
      '3B': { noCol: 'KELAS 3B', nameCol: '__EMPTY_5', genderCol: '__EMPTY_6' },
      '3C': { noCol: 'KELAS 3C', nameCol: '__EMPTY_10', genderCol: '__EMPTY_11' },
      '3D': { noCol: 'KELAS 3D', nameCol: '__EMPTY_15', genderCol: '__EMPTY_16' }
    },
    'KELAS 4': {
      '4A': { noCol: 'KELAS 4A', nameCol: '__EMPTY', genderCol: '__EMPTY_1' },
      '4B': { noCol: 'KELAS 4B', nameCol: '__EMPTY_5', genderCol: '__EMPTY_6' },
      '4C': { noCol: 'KELAS 4C', nameCol: '__EMPTY_10', genderCol: '__EMPTY_11' },
      '4D': { noCol: 'KELAS 4D', nameCol: '__EMPTY_15', genderCol: '__EMPTY_16' }
    },
    'KELAS 5': {
      '5A': { noCol: 'KELAS 5A', nameCol: '__EMPTY', genderCol: '__EMPTY_1' },
      '5B': { noCol: 'KELAS 5B', nameCol: '__EMPTY_5', genderCol: '__EMPTY_6' },
      '5C': { noCol: 'KELAS 5C', nameCol: '__EMPTY_10', genderCol: '__EMPTY_11' }
    },
    'KELAS 6': {
      '6A': { noCol: 'KELAS 6A', nameCol: '__EMPTY', genderCol: '__EMPTY_1' },
      '6B': { noCol: 'KELAS 6B', nameCol: '__EMPTY_5', genderCol: '__EMPTY_6' },
      '6C': { noCol: 'KELAS 6C', nameCol: '__EMPTY_10', genderCol: '__EMPTY_11' }
    }
  };

  const mappings = classColumns[sheetName] || {};

  for (const [classCode, cols] of Object.entries(mappings)) {
    students[classCode] = [];
    
    data.forEach(row => {
      const name = row[cols.nameCol];
      if (name && typeof name === 'string' && name.trim().length > 0 && 
          !['NAMA', 'Laki-laki', 'Perempuan', 'Jumlah'].includes(name.trim())) {
        students[classCode].push(name.trim());
      }
    });
  }

  return students;
};

// Parse all class sheets
['KELAS 1', 'KELAS 2', 'KELAS 3', 'KELAS 4', 'KELAS 5', 'KELAS 6'].forEach(sheet => {
  const students = parseStudentSheet(sheet);
  Object.assign(classesData, students);
});

// Build the output
const output = {
  classes: classesData,
  metadata: classMetadata
};

// Ensure lib directory exists
mkdirSync(dirname('lib/student-data.json'), { recursive: true });

// Write to file
writeFileSync('lib/student-data.json', JSON.stringify(output, null, 2));
console.log('✓ Student data parsed successfully');
console.log(`✓ Found ${Object.keys(classesData).length} classes with ${Object.values(classesData).flat().length} students total`);
