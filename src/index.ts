import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { render } from "mustache";
import { readFile, PathLike } from "fs";
import { promisify } from "util";
import { get as registryGet, getAll } from "@raydeck/registry-manager";
const recursiveCopy = require("recursive-copy");
export function copyDependency(
  dependency: string,
  baseDir: string,
  rootAssetsPath: string
) {
  const path = join(baseDir, "node_modules", dependency);
  if (existsSync(path)) {
    let assetsPath = rootAssetsPath;
    if (existsSync(join(path, "package.json"))) {
      const {
        localAssets: { path: _assetsPath = rootAssetsPath } = {},
      } = JSON.parse(
        readFileSync(join(path, "package.json"), { encoding: "utf8" })
      );
      if (_assetsPath) assetsPath = _assetsPath;
    }
    const fullAssetsPath = join(path, assetsPath);
    if (existsSync(fullAssetsPath)) {
      recursiveCopy(fullAssetsPath, join(baseDir, rootAssetsPath), {
        overwrite: true,
      });
    }
  }
}
export function copyLocalAssets(basePath = process.cwd()) {
  if (basePath !== process.cwd()) process.chdir(basePath);
  const {
    dependencies,
    devDependencies,
    localAssets: { path: rootAssetsPath = "./assets", includeDev = false } = {},
  } = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
  const baseDir = process.cwd();
  const copy = (d: string) => copyDependency(d, baseDir, rootAssetsPath);
  if (dependencies) Object.keys(dependencies).forEach(copy);
  if (devDependencies && includeDev) Object.keys(devDependencies).forEach(copy);
}
const readFileAsync: (path: PathLike) => Promise<Buffer> = promisify(readFile);
export async function loadAsset(key: string) {
  const root = registryGet("assetsPath", "./assets");
  const assetPath = join(root, key);
  return await readFileAsync(assetPath);
}
export async function loadStringAsset(key: string) {
  const buffer = await loadAsset(key);
  const str = buffer.toString("utf8");
  return str;
}
export async function loadRenderedAsset(
  key: string,
  view: Record<string, string>
): Promise<string> {
  const template = await loadStringAsset(key);
  return render(template, { registry: getAll(), ...view });
}
