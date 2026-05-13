import { spawn, spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

if (process.env.SKIP_RAILWAY_BOOTSTRAP !== "true") {
  run("npx", ["prisma", "migrate", "deploy"]);
  run("node", ["scripts/ensure-admin.mjs"]);
  run("node", ["scripts/seed-if-empty.mjs"]);
}

const server = spawn("node", ["server.js"], {
  stdio: "inherit",
  env: process.env,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.kill(signal);
  });
}

server.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
