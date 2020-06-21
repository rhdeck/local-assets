import { join } from "path";
import { existsSync, readFileSync } from "fs";
const recursiveCopy = require("recursive-copy");
function copyDependency(
  dependency: string,
  baseDir: string,
  rootAssetsPath: string
) {
  console.log("Evaluating dependency", dependency);
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
function copyLocalAssets(basePath = process.cwd()) {
  if (basePath !== process.cwd()) process.chdir(basePath);
  const {
    dependencies,
    devDependencies,
    localAssets: { path: rootAssetsPath = "./assets", includeDev = false } = {},
  } = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
  const baseDir = process.cwd();
  console.log("dependencies are", dependencies);
  const copy = (d: string) => copyDependency(d, baseDir, rootAssetsPath);
  if (dependencies) Object.keys(dependencies).forEach(copy);
  if (devDependencies && includeDev) Object.keys(devDependencies).forEach(copy);
}
export { copyDependency, copyLocalAssets };
