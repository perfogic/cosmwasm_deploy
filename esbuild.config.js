const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["scripts/*.ts", "scripts/**/*.ts"],
    bundle: true,
    outdir: "dist",
    format: "cjs",
    platform: "node",
    define: {},
    loader: { ".ts": "ts" },
    write: true,
  })
  .catch(() => process.exit(1));
