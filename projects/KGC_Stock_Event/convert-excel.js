// Script to convert Excel file to JSON format
// Run with: node convert-excel.js

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const workbook = XLSX.readFile('KGC_Stocks.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON array
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

// Stock column mappings
// Column A = Round (index 0)
// Guilsus: B=price(1), C=flatChange(2), D=percentageChange(3)
// Goblin: E=price(4), F=flatChange(5), G=percentageChange(6)
// Alice: H=price(7), I=flatChange(8), J=percentageChange(9)
// Black Market: K=price(10), L=flatChange(11), M=percentageChange(12)
// Aram: N=price(13), O=flatChange(14), P=percentageChange(15)

const stockMappings = [
    { name: 'Guilsus Armory', priceCol: 1, flatCol: 2, percentCol: 3 },
    { name: 'Goblin', priceCol: 4, flatCol: 5, percentCol: 6 },
    { name: 'Alice General Store', priceCol: 7, flatCol: 8, percentCol: 9 },
    { name: 'Black Market', priceCol: 10, flatCol: 11, percentCol: 12 },
    { name: 'Aram Firm', priceCol: 13, flatCol: 14, percentCol: 15 }
];

// Convert to the expected format
const result = [];

// Skip header row if present (check if first row contains text)
let startRow = 0;
if (data.length > 0 && (typeof data[0][0] === 'string' && isNaN(data[0][0]))) {
    startRow = 1;
}

for (let i = startRow; i < data.length; i++) {
    const row = data[i];
    
    // Skip empty rows
    if (!row || row.length === 0 || row[0] === null || row[0] === undefined) {
        continue;
    }

    const round = parseInt(row[0]) || i - startRow + 1;
    const roundData = {
        round: round
    };

    stockMappings.forEach(stock => {
        const price = row[stock.priceCol] !== null && row[stock.priceCol] !== undefined 
            ? parseFloat(row[stock.priceCol]) || 0 
            : 0;
        const flatChange = row[stock.flatCol] !== null && row[stock.flatCol] !== undefined 
            ? parseFloat(row[stock.flatCol]) || 0 
            : 0;
        const percentageChange = row[stock.percentCol] !== null && row[stock.percentCol] !== undefined 
            ? parseFloat(row[stock.percentCol]) || 0 
            : 0;

        roundData[stock.name] = {
            price: price,
            flatChange: flatChange,
            percentageChange: percentageChange
        };
    });

    result.push(roundData);
}

// Write to data.json
const outputPath = path.join(__dirname, 'data.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

console.log(`Successfully converted ${result.length} rounds to data.json`);
console.log(`Output file: ${outputPath}`);

