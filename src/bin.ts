#!/usr/bin/env node
import { readdir, readdirSync, readFileSync, writeFileSync } from "fs";
import { program } from "commander";
import { copyLocalAssets } from "./";
import { basename, join } from "path";
import { format } from "prettier";
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
program
  .command("compile-ts")
  .description("Create typescript renderer functions for all assets")
  .option(
    "-o --output <path>",
    "File to create with the typescript (default: standard output)"
  )
  .action(({ output }) => {
    const {
      dependencies,
      devDependencies,
      localAssets: {
        path: rootAssetsPath = "./assets",
        includeDev = false,
      } = {},
    } = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
    const baseDir = process.cwd();

    let ret = `
import { loadRenderedAsset } from '@raydeck/local-assets';
`;
    const tsFromDir = (dir: string) => {
      return readdirSync(dir)
        .filter((file) => file.endsWith(".html"))
        .map((file) => {
          const target = readFileSync(join(dir, file), {
            encoding: "utf-8",
          });
          //find tokens
          //walk for {{ }}
          let position = 0;
          const positions = [];
          do {
            position = target.indexOf("{{", position);
            if (position == -1) break;
            let endPosition = target.indexOf("}}", position);
            let isRaw = target.substring(position, position + 3) === "{{{";
            positions.push({
              position,
              endPosition,
              content: target.substring(
                isRaw ? position + 3 : position + 2,
                endPosition
              ),
              isRaw,
            });
            position = position + 2;
          } while (position > -1);
          const positionsObj = positions.reduce(
            (o, { position, endPosition, content, isRaw }) => {
              if (!o[content]) {
                return {
                  ...o,
                  [content]: {
                    isRaw,
                    locations: [{ position, endPosition, isRaw }],
                  },
                };
              } else {
                return {
                  ...o,
                  [content]: {
                    ...o[content],
                    locations: [
                      ...o[content].locations,
                      { position, endPosition, isRaw },
                    ],
                  },
                };
              }
            },
            <{ [key: string]: any }>{}
          );

          const base = basename(file, ".html");
          const upperbase = base.charAt(0).toUpperCase() + base.slice(1);
          const renderFunc = "render" + upperbase;
          return `
export const ${renderFunc} = ({${Object.keys(positionsObj).join(
            ","
          )}}: {${Object.keys(positionsObj)
            .map((key) => key + ": string")
            .join(";")}}) => {
      return loadRenderedAsset("${file}",{${Object.keys(positionsObj).join(
            ","
          )}});
}
`;
        })
        .join("\n");
    };
    ret = ret + tsFromDir("./assets");
    if (dependencies)
      ret =
        ret +
        Object.keys(dependencies)
          .map((key) => tsFromDir(join(process.cwd(), "node_modules", key)))
          .join("\n");
    if (devDependencies && includeDev)
      Object.keys(devDependencies)
        .map((key) => tsFromDir(join(process.cwd(), "node_modules", key)))
        .join("\n");
    ret = format(ret, { parser: "babel-ts" });
    console.log("output is ", output);
    if (output) writeFileSync(output, ret);
    else console.log(ret);
  });

program.parse(process.argv);
