import { existsSync, readFileSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// OpenSpec 1.11.0 hardcodes its planning folder. Adapt only this invocation;
// leave the installed package, global settings, and metadata formats untouched.
const require = createRequire(import.meta.url);
const candidates = [];
if (process.env.OPENSPEC_CLI) candidates.push(resolve(process.env.OPENSPEC_CLI));
try { candidates.push(require.resolve("@fission-ai/openspec/bin/openspec.js")); } catch {}
for (const entry of (process.env.PATH ?? "").split(delimiter).filter(Boolean)) {
  candidates.push(join(entry, "node_modules/@fission-ai/openspec/bin/openspec.js"));
  candidates.push(join(entry, "../lib/node_modules/@fission-ai/openspec/bin/openspec.js"));
}
const cli = candidates.find(existsSync);
if (!cli) throw new Error("Install OpenSpec 1.11.0, or set OPENSPEC_CLI to its bin/openspec.js path.");
const packageRoot = resolve(dirname(cli), "..");
const { version } = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
if (version !== "1.11.0") throw new Error(`Unsupported OpenSpec ${version}; review the .openspec adapter before upgrading.`);
const distUrl = pathToFileURL(join(packageRoot, "dist") + "/").href;
registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (!url.startsWith(distUrl) || !url.endsWith(".js") || result.format !== "module") return result;
    const source = typeof result.source === "string" ? result.source : Buffer.from(result.source).toString("utf8");
    return { ...result, source: source
      .replace(/((?:OPENSPEC_DIR_NAME|OPENSPEC_ROOT_DIR)\s*=\s*)(['"])openspec\2/g, "$1$2.openspec$2")
      .replace(/(,\s*)(['"])openspec\2(?=\s*[,\)])/g, "$1$2.openspec$2")
      .replace(/(['"`])openspec\//g, "$1.openspec/")
      .replace(/\/openspec\//g, "/.openspec/") };
  },
});
process.env.OPENSPEC_TELEMETRY = "0";
process.argv[1] = fileURLToPath(pathToFileURL(cli));
await import(pathToFileURL(cli).href);
