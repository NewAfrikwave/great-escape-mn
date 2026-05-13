import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function main() {
  const [packageCount, businessInfoCount, pageContentCount] = await Promise.all([
    prisma.package.count(),
    prisma.businessInfo.count(),
    prisma.pageContent.count(),
  ]);

  if (packageCount > 0 && businessInfoCount > 0 && pageContentCount > 0) {
    console.log("CMS seed skipped: starter content already exists.");
    return;
  }

  console.log("CMS starter content missing; running seed.");
  run("npm", ["run", "seed"]);
}

main()
  .catch((error) => {
    console.error("CMS seed check failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
