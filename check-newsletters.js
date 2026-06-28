import fs from "fs";
import path from "path";
import newslettersData from "./frontend/src/data/newsletters.js"; // adjust if needed

const baseDir = path.resolve("./frontend/public/newsletters");

let missing = [];
let found = [];

for (const year of Object.keys(newslettersData)) {
  for (const nl of newslettersData[year]) {
    const filePath = path.join(baseDir, year, nl.file);
    if (fs.existsSync(filePath)) {
      found.push(filePath);
    } else {
      missing.push(filePath);
    }
  }
}

console.log("✅ Found files:", found.length);
console.log("❌ Missing files:", missing.length);

if (missing.length > 0) {
  console.log("\nMissing files:");
  missing.forEach(f => console.log(" - " + f));
} else {
  console.log("\nAll newsletter files are present!");
}
