import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  process.exit(0);
}

await mkdir(path.join(standaloneDir, ".next"), { recursive: true });

const staticDir = path.join(root, ".next", "static");
if (existsSync(staticDir)) {
  await cp(staticDir, path.join(standaloneDir, ".next", "static"), {
    recursive: true,
  });
}

const publicDir = path.join(root, "public");
if (existsSync(publicDir)) {
  await cp(publicDir, path.join(standaloneDir, "public"), {
    recursive: true,
  });
}
