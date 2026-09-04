#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "${script_dir}/.." && pwd)"
output_path="${1:-${project_root}/Company-Law-English-Lab-local.zip}"
staging_root="$(mktemp -d)"
package_root="${staging_root}/company-law-english-lab"

cleanup() {
  rm -rf "${staging_root}"
}
trap cleanup EXIT

mkdir -p "${package_root}"
tar \
  --exclude='./node_modules' \
  --exclude='./dist' \
  --exclude='./.next' \
  --exclude='./.wrangler' \
  --exclude='./.sites-runtime' \
  --exclude='./.git' \
  --exclude='./startup-log.txt' \
  --exclude='./Company-Law-English-Lab-*.zip' \
  -C "${project_root}" -cf - . | tar -C "${package_root}" -xf -

required_files=(
  "package.json"
  "vite.config.ts"
  ".openai/hosting.json"
  "build/sites-vite-plugin.ts"
  "start-local.bat"
  "start-windows.cmd"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -f "${package_root}/${required_file}" ]]; then
    echo "Required local file is missing: ${required_file}" >&2
    exit 1
  fi
done

mkdir -p "$(dirname "${output_path}")"
(cd "${staging_root}" && zip -qr "${output_path}" company-law-english-lab)
unzip -tq "${output_path}"
echo "Created verified local package: ${output_path}"
