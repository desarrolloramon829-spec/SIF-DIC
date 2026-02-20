const fs = require('fs');
const path = require('path');

const kmlPath = path.join('C:\\Users\\Usuario\\Downloads\\jurisdicciones.kml');
const outPath = path.join(
  __dirname,
  '..',
  'client',
  'public',
  'data',
  'jurisdicciones.geojson'
);

const kml = fs.readFileSync(kmlPath, 'utf8');

// Map folder names to regional codes
const FOLDER_MAP = {
  'UNIDAD REGIONAL NORTE': 'URN',
  'UNIDAD REGIONAL CAPITAL': 'URC',
  'UNIDAD REGIONAL ESTE': 'URE',
  'UNIDAD REGIONAL OESTE': 'URO',
  'UNIDAD REGIONAL SUR': 'URS',
};

const COLORS = {
  URN: '#4CAF50',
  URC: '#2196F3',
  URE: '#FF9800',
  URO: '#9C27B0',
  URS: '#F44336',
};

function parseCoordinates(coordStr) {
  return coordStr
    .trim()
    .split(/\s+/)
    .map(c => {
      const parts = c.split(',');
      return [parseFloat(parts[0]), parseFloat(parts[1])];
    })
    .filter(c => !isNaN(c[0]) && !isNaN(c[1]));
}

function extractFolders(kml) {
  const features = [];
  // Match each Folder
  const folderRegex = /<Folder>([\s\S]*?)<\/Folder>/g;
  let folderMatch;
  while ((folderMatch = folderRegex.exec(kml)) !== null) {
    const folderContent = folderMatch[1];
    const nameMatch = folderContent.match(/<name>(.*?)<\/name>/);
    if (!nameMatch) continue;
    const folderName = nameMatch[1].trim();
    const regional = FOLDER_MAP[folderName];
    if (!regional) continue; // skip DEPENDENCIAS POLICIALES

    // Match each Placemark
    const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let pmMatch;
    while ((pmMatch = placemarkRegex.exec(folderContent)) !== null) {
      const pm = pmMatch[1];
      const pmName = (pm.match(/<name>([\s\S]*?)<\/name>/) || [])[1] || '';
      // Extract coordinates from Polygon or MultiGeometry
      const coordMatches = [];
      const coordRegex = /<coordinates>([\s\S]*?)<\/coordinates>/g;
      let cm;
      while ((cm = coordRegex.exec(pm)) !== null) {
        const coords = parseCoordinates(cm[1]);
        if (coords.length > 2) coordMatches.push(coords);
      }
      if (coordMatches.length === 0) continue;

      if (coordMatches.length === 1) {
        features.push({
          type: 'Feature',
          properties: {
            name: pmName.trim(),
            regional,
            color: COLORS[regional],
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordMatches[0]],
          },
        });
      } else {
        features.push({
          type: 'Feature',
          properties: {
            name: pmName.trim(),
            regional,
            color: COLORS[regional],
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: coordMatches.map(c => [c]),
          },
        });
      }
    }
  }
  return features;
}

const features = extractFolders(kml);
const geojson = {
  type: 'FeatureCollection',
  features,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(geojson));
console.log(`Convertido: ${features.length} features → ${outPath}`);
