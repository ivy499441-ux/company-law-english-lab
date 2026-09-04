import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const targetPath = path.join(
  projectRoot,
  "node_modules",
  "vinext",
  "dist",
  "server",
  "static-file-cache.js",
);

if (process.platform !== "win32") {
  console.log("Vinext static-cache compatibility patch is not needed on this platform.");
  process.exit(0);
}

if (!fs.existsSync(targetPath)) {
  throw new Error(`Vinext runtime file is missing: ${targetPath}`);
}

const source = fs.readFileSync(targetPath, "utf8");
const unpatchedLine = "relativePath: path.relative(base, batch[j]),";
const patchedLine =
  'relativePath: path.relative(base, batch[j]).split(path.sep).join("/"),';

if (source.includes(patchedLine)) {
  console.log("Vinext Windows static-cache compatibility patch is already active.");
  process.exit(0);
}

if (!source.includes(unpatchedLine)) {
  throw new Error(
    "The installed Vinext static-cache implementation is different from the verified version. No automatic patch was applied.",
  );
}

fs.writeFileSync(targetPath, source.replace(unpatchedLine, patchedLine), "utf8");
console.log("Applied Vinext Windows static-cache compatibility patch.");
