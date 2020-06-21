# local-assets

Local asset hoister from dependencies

## Usage

```
❯ yarn -s local-assets --help
Usage: local-assets [options] [command]

Options:
  -h, --help       display help for command

Commands:
  start            hoist local assets from dependencies
  set-path <path>  set the local assets path (currently ./assets)
  set-usedev       use dev dependencies for asset path search (currently
                   false)
  set-nodev        do not use dev dependencies for asset path search
                   (currently false)
  help [command]   display help for command

```

## Commands

`local-assets` uses subcommands for its execution pattern

### local-assets start

Recursively copy the contents from the subdirectory paths specified by the "path" (e.g. `/assets`) from each dependency (and devDependency if that setting is on) to the "path" relative to project root. E.g. from dependency `my-dependency` files and folders in `node_modules/my_dependency/assets` into `./assets`.

### local-assets set-path <newPath>

Establish the relative path to both receive assets from and load them into your root project

### local-assets set-usedev

Use development dependencies (in `devDependencies`) as well as main `dependencies` to find assets

### local-assets set-nodev

Do not use development dependencies.
