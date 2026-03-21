import fs from 'fs';

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

function processCsv(csvPath, outJsonPath) {
  const content = fs.readFileSync(csvPath, 'utf8');

  const lines = content.split('\n');
  const headerLineStr = lines.find(l => l.startsWith('"Country Name"'));
  if (!headerLineStr) {
    console.log("No headers found for " + csvPath);
    return;
  }
  const headerCols = headerLineStr.split('","').map(s => s.replace(/"/g, ''));
  const yr2023Idx = headerCols.indexOf('2023');

  const gdpMap = {};

  for (const line of lines) {
    if (!line || line.startsWith('"Country Name"') || line.startsWith('"Data Source"') || line.startsWith('"Last Updated')) continue;
    
    const cols = line.split('","').map(s => s.replace(/^"|"$/g, ''));
    // Make sure we have enough columns to hit the indices, fallback if missing
    if (cols.length <= yr2023Idx - 2) continue;
    
    const name = cols[0];
    let val2023 = yr2023Idx < cols.length ? parseFloat(cols[yr2023Idx]) : NaN;
    let val2022 = (yr2023Idx - 1) < cols.length ? parseFloat(cols[yr2023Idx - 1]) : NaN;
    let val2021 = (yr2023Idx - 2) < cols.length ? parseFloat(cols[yr2023Idx - 2]) : NaN;
    let val = !isNaN(val2023) ? val2023 : (!isNaN(val2022) ? val2022 : (!isNaN(val2021) ? val2021 : null));
    
    if (val) {
      gdpMap[name] = val;
      if (knownIso2[name]) {
          gdpMap[knownIso2[name]] = val;
      }
    }
  }

  if (gdpMap["Korea, Dem. People's Rep."]) gdpMap["KP"] = gdpMap["Korea, Dem. People's Rep."];
  if (gdpMap["Venezuela, RB"]) gdpMap["VE"] = gdpMap["Venezuela, RB"];

  fs.mkdirSync('public/data', { recursive: true });
  fs.writeFileSync(outJsonPath, JSON.stringify(gdpMap, null, 2));

  console.log(`Successfully generated ${outJsonPath}`);
}

processCsv('data/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_133326/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_133326.csv', 'public/data/gdp.json');
processCsv('data/API_FI.RES.TOTL.CD_DS2_en_csv_v2_379/API_FI.RES.TOTL.CD_DS2_en_csv_v2_379.csv', 'public/data/reserves.json');
