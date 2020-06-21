#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { program } from "commander";
import { copyLocalAssets } from "./";
const {
  localAssets: { path = "./assets", includeDev = false } = {},
} = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
program
  .command("start")
  .description(
    "hoist local assets from dependencies" + includeDev
      ? " and devDependencies"
      : ""
  )
  .action(() => {
    console.log("hoisting assets");
    copyLocalAssets();
  });
program
  .command("set-path <path>")
  .description("set the local assets path (currently " + path + ")")
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
  .description(
    "use dev dependencies for asset path search (currently " +
      Boolean(includeDev).toString() +
      ")"
  )
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
  .description(
    "do not use dev dependencies for asset path search (currently " +
      Boolean(includeDev).toString() +
      ")"
  )
  .action(() => {
    const o = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
    if (!o.localAssets) o.localAssets = {};
    if (o.localAssets.includeDev) {
      o.localAssets.includeDev = false;
      writeFileSync("./package.json", JSON.stringify(o, null, 2));
    }
  });
program.parse(process.argv);
