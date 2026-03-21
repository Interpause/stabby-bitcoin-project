import fs from 'fs';

const csvPath = 'data/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_133326/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_133326.csv';
const content = fs.readFileSync(csvPath, 'utf8');

const lines = content.split('\n');
const headerLineStr = lines.find(l => l.startsWith('"Country Name"'));
const headerCols = headerLineStr.split('","').map(s => s.replace(/"/g, ''));
const yr2023Idx = headerCols.indexOf('2023');

const gdpMap = {};
const knownIso2 = {
  "United States": "US",
  "China": "CN",
  "United Kingdom": "GB",
  "Korea, Dem. People's Rep.": "KP",
  "Bhutan": "BT",
  "El Salvador": "SV",
  "Venezuela, RB": "VE", 
  "Finland": "FI",
  "Germany": "DE",
  "Bulgaria": "BG",
  "United Arab Emirates": "AE"
};

for (const line of lines) {
  if (!line || line.startsWith('"Country Name"') || line.startsWith('"Data Source"') || line.startsWith('"Last Updated')) continue;
  
  const cols = line.split('","').map(s => s.replace(/^"|"$/g, ''));
  if (cols.length < yr2023Idx) continue;
  
  const name = cols[0];
  let gdp2023 = parseFloat(cols[yr2023Idx]);
  let gdp2022 = parseFloat(cols[yr2023Idx - 1]);
  let gdp = !isNaN(gdp2023) ? gdp2023 : (!isNaN(gdp2022) ? gdp2022 : null);
  
  if (gdp) {
    gdpMap[name] = gdp;
    if (knownIso2[name]) {
        gdpMap[knownIso2[name]] = gdp;
    }
  }
}

if (gdpMap["Korea, Dem. People's Rep."]) gdpMap["KP"] = gdpMap["Korea, Dem. People's Rep."];
if (gdpMap["Venezuela, RB"]) gdpMap["VE"] = gdpMap["Venezuela, RB"];

fs.mkdirSync('public/data', { recursive: true });
fs.writeFileSync('public/data/gdp.json', JSON.stringify(gdpMap, null, 2));

console.log("Successfully generated public/data/gdp.json");
console.log("Found US:", gdpMap["US"]);
console.log("Found VE:", gdpMap["VE"]);
console.log("Found KP:", gdpMap["KP"]);
