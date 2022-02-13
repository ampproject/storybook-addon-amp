import esbuild from 'esbuild';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const bundleNodeModules = new Set(['preact', 'preact-render-to-string']);

const externalResolverPlugin = {
  name: 'external-resolver',
  async setup(build) {
    build.onResolve({filter: /.*/}, (args) => {
      if (!args.path.startsWith('.') && !bundleNodeModules.has(args.path)) {
        return {external: true, path: args.path};
      }
    });
  },
};

async function build() {
  await esbuild.build({
    entryPoints: ['src/index.ts', 'src/register/index.tsx'],
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    logLevel: 'info',
    watch: argv.watch,
    minifySyntax: true,
    plugins: [externalResolverPlugin],
    format: 'esm',
    target: 'es2017',
  });
}

build();
