// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/pix-qrcode-wrapper.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
  },
  scriptModule: false,
  package: {
    // package.json properties
    name: "@nascent/pix-qrcode-tool",
    version: Deno.args[0],
    license: "MIT",
  //   repository: {
  //     type: "git",
  //     url: "git+https://github.com/username/repo.git",
  //   },
  //   bugs: {
  //     url: "https://github.com/username/repo/issues",
  //   },
  },
});

