import { spawnSync } from "node:child_process"

const [, , testType, ...jestArgs] = process.argv

if (!testType) {
  console.error("Usage: node ./scripts/run-jest.mjs <TEST_TYPE> [...jest args]")
  process.exit(1)
}

process.env.TEST_TYPE = testType
process.env.NODE_OPTIONS = [
  process.env.NODE_OPTIONS,
  "--experimental-vm-modules",
]
  .filter(Boolean)
  .join(" ")

const jestBin = process.platform === "win32" ? "jest.cmd" : "jest"
const result = spawnSync(jestBin, jestArgs, {
  stdio: "inherit",
  shell: process.platform === "win32",
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
