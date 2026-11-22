import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const force = args.includes("--force") || args.includes("-f") || process.env.CONFIRM_RESET === "yes";

if (!force) {
  console.error("================================================================================");
  console.error("WARNING: dev:stack:reset will DESTROY all local database volumes and data!");
  console.error("To execute, run: pnpm dev:stack:reset -- --force (or CONFIRM_RESET=yes)");
  console.error("================================================================================");
  process.exit(1);
}

console.log("Resetting development stack and removing all persistent volumes...");
try {
  execSync("docker compose -f infra/compose/docker-compose.yml down -v", {
    stdio: "inherit",
  });
  console.log("Stack reset successfully.");
} catch (err) {
  console.error("Failed to reset stack:", err);
  process.exit(1);
}
