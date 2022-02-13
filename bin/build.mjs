import esbuild from 'esbuild';
import {readFile} from 'fs/promises';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const readJson = async (path) =>
  JSON.parse(await readFile(new URL(path, import.meta.url)));

const preactCompatPlugin = {
  name: 'preact-compat',
  async setup(build) {
    const path = await import('path');
    const preact = path.join(
      process.cwd(),
      'node_modules',
      'preact',
      'compat',
      'dist',
      'compat.module.js'
    );
    build.onResolve({filter: /^(react-dom|react)$/}, (args) => {
      return {path: preact};
    });
  },
};

async function build() {
  const pkg = await readJson('../package.json');

  const external = [
    [
      ...Object.keys(pkg.devDependencies),
      ...Object.keys(pkg.dependencies),
    ].filter((name) => name.startsWith('@storybook/')),
    Object.keys(pkg.peerDependencies),
  ].flat();

  const builds = {
    'dist/esm': {format: 'esm', target: 'es2017'},
    'dist/cjs': {format: 'cjs'},
  };

  await Promise.all(
    Object.entries(builds).map(async ([outdir, options]) => {
      await esbuild.build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        platform: 'node',
        logLevel: 'info',
        plugins: [preactCompatPlugin],
        watch: argv.watch,
        external,
        outdir,
        ...options,
      });
    })
  );
}

build();
