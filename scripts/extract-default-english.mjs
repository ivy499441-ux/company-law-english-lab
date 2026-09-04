import { access, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const projectRoot = new URL("../", import.meta.url);
let sourcePdf;
for (const filename of ["公司法英文版.pdf", "公司法英文版（威科先行译版）.pdf"]) {
  const candidate = fileURLToPath(new URL(filename, projectRoot));
  try {
    await access(candidate);
    sourcePdf = candidate;
    break;
  } catch {
    // Try the next supported filename.
  }
}
if (!sourcePdf) {
  throw new Error("Default English PDF was not found in the project root.");
}
const outputJson = fileURLToPath(
  new URL("../app/data/default-english.json", import.meta.url),
);

const bytes = new Uint8Array(await readFile(sourcePdf));
const document = await pdfjs.getDocument({ data: bytes, disableWorker: true }).promise;
const pages = [];

// The Company Law translation occupies the first 59 pages. Page 60 is read as
// a safe boundary because the supplied PDF contains additional documents.
for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 60); pageNumber += 1) {
  const page = await document.getPage(pageNumber);
  const content = await page.getTextContent();
  pages.push(content.items.map((item) => {
    if (!("str" in item)) return "";
    return `${item.str}${"hasEOL" in item && item.hasEOL ? "\n" : " "}`;
  }).join(""));
}

const source = pages.join("\n");
const starts = [];
let cursor = 0;

for (let number = 1; number <= 266; number += 1) {
  const marker = `Article ${number} `;
  const index = source.indexOf(marker, cursor);
  if (index < 0) throw new Error(`Default PDF: Article ${number} was not found.`);
  starts.push({ number, index, marker });
  cursor = index + marker.length;
}

const imported = {};
for (const [index, item] of starts.entries()) {
  const fallbackEnd = source.indexOf("Securities Law of the", item.index);
  const end = starts[index + 1]?.index
    ?? (fallbackEnd > item.index ? fallbackEnd : source.length);
  imported[String(item.number)] = source.slice(item.index + item.marker.length, end)
    .replace(/Company Law of the People's Republic of China \(Revised in 2023\)/g, "")
    .replace(/\b\d+\s*\/\s*(?:59|57)\b/g, "")
    .replace(/Chapter [IVXLCDM]+[^\n]*/g, "")
    .replace(/Section \d+[^\n]*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

if (Object.keys(imported).length !== 266 || Object.values(imported).some((text) => !text)) {
  throw new Error("Default PDF extraction did not produce 266 non-empty articles.");
}

await writeFile(outputJson, `${JSON.stringify(imported, null, 2)}\n`, "utf8");
console.log(`Extracted ${Object.keys(imported).length} default English articles.`);
