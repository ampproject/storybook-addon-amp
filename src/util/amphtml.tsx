/** @jsx h */
import {h} from 'preact';
import {renderToString as preactRenderToString} from 'preact-render-to-string';
import {SOURCE_BASE_URL, Config} from './config';
import {collectInlineAmpScripts, maybeGenerateCspHashMeta} from './amp-script';
import {collectNodes} from './vnode';
import {encodeHtmlEntities} from './html';
import type {VNode} from 'preact';

const EXT_TYPES = {
  'amp-mustache': 'template',
};

function getStyleAmpCustom(tree: VNode) {
  const styles = collectNodes(
    tree,
    (node) =>
      node?.type === 'style' && typeof node?.props?.children === 'string',
    /* clear */ true
  ).map(({props}) => props.children) as string[];
  return preactRenderToString(
    <style amp-custom dangerouslySetInnerHTML={{__html: styles.join('\n')}} />
  );
}

function getExtType(name: string) {
  return EXT_TYPES[name] || 'element';
}

function getBase(config: Config): string {
  if (!config.baseUrl.startsWith('http://localhost')) {
    return '';
  }
  return `<base href="${new URL(config.baseUrl).origin}">`;
}

function get3pIframeMeta(config: Config): string {
  if (!config.baseUrl.startsWith('http://localhost')) {
    return '';
  }
  const baseUrl3p = config.baseUrl.replace('//localhost', '//ads.localhost');
  const src3p = new URL('/dist.3p/current/frame.max.html', baseUrl3p).href;
  return `<meta name="amp-3p-iframe-src" content="${src3p}">`;
}

function getAmpUrl(
  module: string,
  version: string | null,
  type: string,
  config: Config
): string {
  let {baseUrl} = config;
  const unminifiedFiles = baseUrl.startsWith('http://localhost');
  if (baseUrl === SOURCE_BASE_URL.cdn && config.rtv) {
    baseUrl += `/rtv/${config.rtv}`;
  }
  const ext =
    type === 'css' ? 'css' : config.binary === 'no-modules' ? 'js' : 'mjs';

  // v0.js
  if (module === 'amp') {
    return `${baseUrl}/${unminifiedFiles ? 'amp' : 'v0'}.${ext}`;
  }

  // Extension.
  return `${baseUrl}/v0/${module}-${version || '0.1'}${
    unminifiedFiles ? '.max' : ''
  }.${ext}`;
}

function getAmpToggleExperimentsScript(experiments) {
  if (!experiments?.length) {
    return '';
  }
  return /* HTML */ `
    <script>
      (window.AMP = window.AMP || []).push(function (AMP) {
        ${experiments
          .map((exp) => `AMP.toggleExperiment('${exp}', true, true);`)
          .join('')};
      });
    </script>
  `;
}

function getAmpScriptAndStylesheet(
  config,
  name,
  version = null,
  attributes = ''
) {
  return /* HTML */ `
    ${config.binary === 'modules'
      ? /* HTML */ `
          <link
            rel="stylesheet"
            href="${getAmpUrl(name, version, 'css', config)}"
          />
        `
      : ''}
    <script
      async
      ${attributes}
      src="${getAmpUrl(name, version, 'js', config)}"
    ></script>
  `;
}

export function wrapAmpHtml(tree, config, context) {
  const {parameters} = context;
  const boilerplate = `<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>`;
  return /* HTML */ `
    <!DOCTYPE html>
    <html amp lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${encodeHtmlEntities(context.title)}</title>
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,initial-scale=1"
        />
        ${[
          maybeGenerateCspHashMeta(collectInlineAmpScripts(tree)),
          getBase(config),
          get3pIframeMeta(config),
          getAmpToggleExperimentsScript(parameters?.experiments),
          getAmpScriptAndStylesheet(config, 'amp'),
          boilerplate,
          parameters?.extensions?.map(({name, version}) =>
            getAmpScriptAndStylesheet(
              config,
              name,
              version,
              `custom-${getExtType(name)}="${name}"`
            )
          ),
          getStyleAmpCustom(tree),
        ]
          .flat()
          .filter(Boolean)
          .join('')}
      </head>
      <body></body>
    </html>
  `;
}
