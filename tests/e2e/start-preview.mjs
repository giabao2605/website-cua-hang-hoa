import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const wranglerRoot = resolve(projectRoot, ".wrangler");
const statePath = resolve(wranglerRoot, "state-e2e");

if (relative(wranglerRoot, statePath) !== "state-e2e") {
  throw new Error("Refusing to reset E2E state outside the project .wrangler directory");
}

const run = (entrypoint, args, env = process.env) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(process.execPath, [entrypoint, ...args], {
      cwd: projectRoot,
      env,
      stdio: "inherit",
    });

    child.once("error", rejectRun);
    child.once("exit", (code, signal) => {
      if (signal) rejectRun(new Error(`${entrypoint} stopped by ${signal}`));
      else if (code === 0) resolveRun();
      else rejectRun(new Error(`${entrypoint} exited with code ${code}`));
    });
  });

const wrangler = resolve(projectRoot, "node_modules/wrangler/bin/wrangler.js");
const vite = resolve(projectRoot, "node_modules/vite/bin/vite.js");
const persistArgs = ["--local", "--persist-to", statePath];

await rm(statePath, { recursive: true, force: true });
await run(
  wrangler,
  ["d1", "migrations", "apply", "tram-florist-local-db", ...persistArgs],
  { ...process.env, CI: "true" },
);
await run(
  wrangler,
  [
    "d1",
    "execute",
    "tram-florist-local-db",
    ...persistArgs,
    "--file",
    "db/seed.sql",
  ],
  { ...process.env, CI: "true" },
);

const preview = spawn(
  process.execPath,
  [vite, "preview", "--host", "127.0.0.1", "--port", "3100", "--strictPort"],
  {
    cwd: projectRoot,
    env: { ...process.env, TRAM_FLORIST_E2E_STATE_PATH: statePath },
    stdio: "inherit",
  },
);

const stopPreview = (signal) => preview.kill(signal);
process.once("SIGINT", stopPreview);
process.once("SIGTERM", stopPreview);

preview.once("error", (error) => {
  throw error;
});
preview.once("exit", (code, signal) => {
  process.removeListener("SIGINT", stopPreview);
  process.removeListener("SIGTERM", stopPreview);
  process.exitCode = code ?? (signal ? 1 : 0);
});
