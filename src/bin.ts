import { readFileSync, writeFileSync } from "fs";
import { program } from "commander";
program
  .command("start")
  .description("hoist local assets")
  .action(() => {});
program
  .command("set-path <path>")
  .description("set the local assets path")
  .action((path) => {
    const o = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
    if (!o.localAssets) o.localAssets = {};
    if (o.localAssets.path !== path) {
      o.localAssets.path = path;
      writeFileSync("./package.json", JSON.stringify(o, null, 2));
    }
  });
program
  .command("set-usedev")
  .description("use dev dependencies for asset path search")
  .action(() => {
    const o = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
    if (!o.localAssets) o.localAssets = {};
    if (!o.localAssets.includeDev) {
      o.localAssets.includeDev = true;
      writeFileSync("./package.json", JSON.stringify(o, null, 2));
    }
  });
program
  .command("set-nodev")
  .description("do not use dev dependencies for asset path search")
  .action(() => {
    const o = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
    if (!o.localAssets) o.localAssets = {};
    if (o.localAssets.includeDev) {
      o.localAssets.includeDev = false;
      writeFileSync("./package.json", JSON.stringify(o, null, 2));
    }
  });
program.parseOptions(process.argv);
