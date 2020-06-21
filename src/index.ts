import { join } from "path";
import { existsSync, readFileSync } from "fs";
import recursiveCopy from "recursive-copy";
function copyDependency(dependency, baseDir, rootAssetsPath) {
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
    localAssets: { path: rootAssetsPath = "./assets", includeDev = false },
  } = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
  const baseDir = process.cwd();
  const copy = (d) => copyDependency(d, baseDir, rootAssetsPath);
  if (dependencies) dependencies.forEach(copy);
  if (devDependencies && includeDev) devDependencies.forEach(copy);
}
export { copyDependency, copyLocalAssets };
