import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const nextCli = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);
const extractor = fileURLToPath(
  new URL("./extract-default-english.mjs", import.meta.url),
);
const projectRoot = fileURLToPath(new URL("..", import.meta.url));

const extraction = spawnSync(process.execPath, [extractor], {
  cwd: projectRoot,
  stdio: "inherit",
});

if (extraction.error) {
  throw extraction.error;
}

if (extraction.status !== 0) {
  process.exit(extraction.status ?? 1);
}

const result = spawnSync(process.execPath, [nextCli, "build"], {
  cwd: projectRoot,
  env: { ...process.env, STATIC_EXPORT: "true" },
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
