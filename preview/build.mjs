import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

const root = path.resolve(import.meta.dirname, "..");
const mock = path.join(root, "preview", "cockpit.js");
const outdir = path.join(root, "preview", "dist");
fs.mkdirSync(outdir, { recursive: true });
fs.copyFileSync(path.join(root, "preview", "index.html"), path.join(outdir, "index.html"));
fs.copyFileSync(path.join(root, "preview", "preview-network.html"), path.join(outdir, "preview-network.html"));
fs.copyFileSync(path.join(root, "preview", "linux-hero-background.png"), path.join(outdir, "linux-hero-background.png"));
fs.copyFileSync(path.join(root, "preview", "linux-hero-background-dark.png"), path.join(outdir, "linux-hero-background-dark.png"));
fs.cpSync(path.join(root, "node_modules", "@patternfly", "patternfly", "assets"), path.join(outdir, "assets"), { recursive: true });

const context = await esbuild.context({
    entryPoints: [path.join(root, "preview", "main.jsx")],
    bundle: true,
    external: ["*.woff", "*.woff2", "*.jpg", "*.png", "*.svg", "../../assets*"],
    outfile: path.join(outdir, "preview.js"),
    loader: { ".js": "jsx", ".txt": "text", ".py": "text" },
    nodePaths: [path.join(root, "pkg", "lib")],
    plugins: [
        { name: "preview-cockpit", setup(build) {
            build.onResolve({ filter: /^cockpit$/ }, () => ({ path: mock }));
        } },
        sassPlugin({ loadPaths: [path.join(root, "pkg", "lib"), path.join(root, "node_modules")], quietDeps: true }),
    ],
    sourcemap: true,
    logLevel: "warning",
});

if (process.argv.includes("--watch")) {
    await context.watch();
    console.log("Watching preview source");
} else {
    await context.rebuild();
    await context.dispose();
    console.log("Preview built");
}
