import { execSync } from "node:child_process";

console.log("=== Meridian Monorepo Verification Pipeline ===");

function runStep(name, cmd) {
  console.log(`\n--> Running: ${name} (${cmd})`);
  try {
    execSync(cmd, { stdio: "inherit" });
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    process.exit(1);
  }
}

// 1. Monorepo JS/TS quality gates
runStep("TypeScript & Lint Quality Gates", "pnpm turbo run lint typecheck test build");

// 2. Go Backend quality gates
runStep("Go Vet", "cd backend && go vet ./...");
runStep("Go Race Unit Tests", "cd backend && go test -race -v ./...");
runStep("Go Build", "cd backend && go build ./cmd/api");

console.log("\n[SUCCESS] All verification gates passed cleanly!");
