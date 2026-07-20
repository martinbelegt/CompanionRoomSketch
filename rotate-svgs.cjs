const fs = require("fs");
const path = require("path");

const inputFolder = process.argv[2];
const direction = (process.argv[3] || "rechts").toLowerCase();
const outputFolder =
  process.argv[4] ||
  path.join(
    inputFolder || "",
    direction === "links" ? "gedraaid-links" : "gedraaid-rechts",
  );

if (!inputFolder) {
  console.error(`
Gebruik:

node rotate-svgs.cjs "D:\\pad\\naar\\svg-map" rechts

of:

node rotate-svgs.cjs "D:\\pad\\naar\\svg-map" links
`);
  process.exit(1);
}

if (!["rechts", "links"].includes(direction)) {
  console.error('De draairichting moet "rechts" of "links" zijn.');
  process.exit(1);
}

if (!fs.existsSync(inputFolder)) {
  console.error(`De invoermap bestaat niet: ${inputFolder}`);
  process.exit(1);
}

fs.mkdirSync(outputFolder, { recursive: true });

const svgFiles = fs
  .readdirSync(inputFolder)
  .filter((filename) => filename.toLowerCase().endsWith(".svg"));

if (svgFiles.length === 0) {
  console.error(`Geen SVG-bestanden gevonden in: ${inputFolder}`);
  process.exit(1);
}

function getAttribute(tag, attributeName) {
  const match = tag.match(
    new RegExp(`\\s${attributeName}\\s*=\\s*["']([^"']+)["']`, "i"),
  );

  return match ? match[1] : null;
}

function setAttribute(tag, attributeName, value) {
  const expression = new RegExp(
    `(\\s${attributeName}\\s*=\\s*)["'][^"']*["']`,
    "i",
  );

  if (expression.test(tag)) {
    return tag.replace(expression, `$1"${value}"`);
  }

  return tag.replace(/>$/, ` ${attributeName}="${value}">`);
}

function parseViewBox(viewBox) {
  const values = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  if (values.length !== 4 || values.some(Number.isNaN)) {
    return null;
  }

  const [x, y, width, height] = values;

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { x, y, width, height };
}

function rotateSvg(svgText, filename) {
  const openingMatch = svgText.match(/<svg\b[^>]*>/i);

  if (!openingMatch) {
    throw new Error("Geen geldige <svg>-opening gevonden.");
  }

  const openingTag = openingMatch[0];
  const viewBoxValue = getAttribute(openingTag, "viewBox");

  if (!viewBoxValue) {
    throw new Error("De SVG bevat geen viewBox.");
  }

  const viewBox = parseViewBox(viewBoxValue);

  if (!viewBox) {
    throw new Error(`Ongeldige viewBox: ${viewBoxValue}`);
  }

  const { x, y, width, height } = viewBox;

  let transform;

  if (direction === "rechts") {
    // Nieuw punt: X = hoogte - oude Y, Y = oude X
    transform = `matrix(0 1 -1 0 ${height + y} ${-x})`;
  } else {
    // Nieuw punt: X = oude Y, Y = breedte - oude X
    transform = `matrix(0 -1 1 0 ${-y} ${width + x})`;
  }

  let newOpeningTag = setAttribute(
    openingTag,
    "viewBox",
    `0 0 ${height} ${width}`,
  );

  const oldWidth = getAttribute(openingTag, "width");
  const oldHeight = getAttribute(openingTag, "height");

  if (oldWidth && oldHeight) {
    newOpeningTag = setAttribute(newOpeningTag, "width", oldHeight);
    newOpeningTag = setAttribute(newOpeningTag, "height", oldWidth);
  }

  const openingIndex = svgText.indexOf(openingTag);
  const contentStart = openingIndex + openingTag.length;
  const closingIndex = svgText.toLowerCase().lastIndexOf("</svg>");

  if (closingIndex === -1) {
    throw new Error("Geen afsluitende </svg> gevonden.");
  }

  const beforeSvg = svgText.slice(0, openingIndex);
  const innerContent = svgText.slice(contentStart, closingIndex);
  const afterSvg = svgText.slice(closingIndex);

  return `${beforeSvg}${newOpeningTag}
  <g transform="${transform}">
${innerContent}
  </g>
${afterSvg}`;
}

let successCount = 0;
let errorCount = 0;

for (const filename of svgFiles) {
  const inputPath = path.join(inputFolder, filename);
  const extension = path.extname(filename);
  const baseName = path.basename(filename, extension);

  const suffix = direction === "links" ? "-links" : "-rechts";
  const outputPath = path.join(
    outputFolder,
    `${baseName}${suffix}${extension}`,
  );

  try {
    const svgText = fs.readFileSync(inputPath, "utf8");
    const rotatedSvg = rotateSvg(svgText, filename);

    fs.writeFileSync(outputPath, rotatedSvg, "utf8");

    console.log(`✓ ${filename} → ${path.basename(outputPath)}`);
    successCount += 1;
  } catch (error) {
    console.error(`✗ ${filename}: ${error.message}`);
    errorCount += 1;
  }
}

console.log(`
Klaar.

Gedraaid: ${successCount}
Mislukt: ${errorCount}
Uitvoermap: ${outputFolder}
`);
