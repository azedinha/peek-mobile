import { execSync } from "node:child_process";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import os from "node:os";
import zlib from "node:zlib";

const buildId = process.argv[2];
if (!buildId) {
  console.error("Usage: node scripts/fetch-eas-logs.mjs <build-id>");
  process.exit(1);
}

const raw = execSync(`npx eas build:view ${buildId} --json`, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
const jsonStart = raw.indexOf("{");
const build = JSON.parse(raw.slice(jsonStart));
const logUrl = build.logFiles?.[0];
if (!logUrl) {
  console.error("No logFiles in build metadata");
  process.exit(1);
}

const rawPath = path.join(os.tmpdir(), `eas-build-${buildId}.raw`);
const outPath = path.join(os.tmpdir(), `eas-build-${buildId}.txt`);

await new Promise((resolve, reject) => {
  https
    .get(logUrl, (res) => {
      console.error("status", res.statusCode, "encoding", res.headers["content-encoding"], "type", res.headers["content-type"]);
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(rawPath, buf);
        console.error("raw bytes", buf.length, "magic", buf.subarray(0, 8).toString("hex"));

        const attempts = [
          ["utf8", () => buf.toString("utf8")],
          ["gunzip", () => zlib.gunzipSync(buf).toString("utf8")],
          ["inflate", () => zlib.inflateSync(buf).toString("utf8")],
          ["inflateRaw", () => zlib.inflateRawSync(buf).toString("utf8")],
          ["brotli", () => zlib.brotliDecompressSync(buf).toString("utf8")],
        ];

        for (const [name, fn] of attempts) {
          try {
            const text = fn();
            if (text.includes("Install dependencies") || text.includes("npm") || text.includes("error")) {
              fs.writeFileSync(outPath, text);
              console.log(outPath);
              console.log("decoded with", name);
              resolve();
              return;
            }
          } catch {
            // try next
          }
        }
        reject(new Error("Could not decode log payload"));
      });
    })
    .on("error", reject);
});
