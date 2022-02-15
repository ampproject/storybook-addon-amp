# Developing

## Command line

### Installing dependencies

```console
npm install
```

### Building

```console
npm run build
```

### Development

You can watch to rebuild on every change using:

```console
npm run watch
```

To test, you may run the example Storybook:

```console
npm run storybook
```

For a manual testing workflow, you should run `watch` and `storybook` at the same time.

## Testing local version elsewhere

You may configure a user package (like `amphtml`) to use your locally built version by using a [package path.](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#local-paths)

### In [`ampproject/amphtml`](https://github.com/ampproject/amphtml/)

Point to a local copy on `build-system/tasks/storybook/package.json`. The following relative path has `amphtml/` and `storybook-addon-amp/` on the same level directory:

```diff
  "devDependencies" {
-   "@ampproject/storybook-addon": "1.1.1",
+   "@ampproject/storybook-addon": "file:../../../../../storybook-addon-amp",
  }
```

This way, you may use the local addon package's `npm run dev` in conjunction with `amp storybook` under `amphtml/`. Changes are picked up automatically.
