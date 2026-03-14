import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const notFoundPath = path.join(distDir, "404.html");

if (!fs.existsSync(indexPath)) {
    throw new Error("dist/index.html not found");
}

fs.copyFileSync(indexPath, notFoundPath);
console.log("Created dist/404.html");