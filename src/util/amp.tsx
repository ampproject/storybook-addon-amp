/** @jsx h */
import {h} from 'preact';
import {renderToString as preactRenderToString} from 'preact-render-to-string';
import {SOURCE_BASE_URL, Config} from './config';
import {collectNodes} from './vnode';
import {HtmlChildren} from './html';
import {createHash} from 'crypto';
import type {VNode} from 'preact';
import {AmpParameters} from '../addon';
import {getRtvUrl} from './cdn-url';

const EXT_TYPES = {
  'amp-mustache': 'template',
};

export function generateCspHash(script) {
  const hash = createHash('sha384');
  const data = hash.update(script, 'utf8');

  return (
    'sha384-' +
    data
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  );
}

export function collectInlineAmpScripts(
  tree: preact.VNode<{target?: string}>
): string[] {
  return collectNodes(
    tree,
    (node) =>
      node?.type === 'script' &&
      node?.props?.target === 'amp-script' &&
      typeof node?.props?.children === 'string'
  ).map(({props}) => props.children) as string[];
}

export function maybeGenerateCspHashMeta(scripts: string[]) {
  if (scripts.length < 1) {
    return '';
  }
  return `<meta name="amp-script-src" content="${scripts
    .map((script) => generateCspHash(script))
    .join(' ')}" />`;
}

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

function maybeGetBaseHref(config: Config): HtmlChildren {
  if (!config.baseUrl.startsWith('http://localhost')) {
    return null;
  }
  return `<base href="${new URL(config.baseUrl).origin}">`;
}

function get3pIframeMeta(config: Config): HtmlChildren {
  if (!config.baseUrl.startsWith('http://localhost')) {
    return null;
  }
  const baseUrl3p = config.baseUrl.replace('//localhost', '//ads.localhost');
  const src3p = new URL('/dist.3p/current/frame.max.html', baseUrl3p).href;
  return `<meta name="amp-3p-iframe-src" content="${src3p}">`;
}

function getAmpUrl(
  module: string,
  version: string | null | undefined,
  type: string,
  config: Config
): string {
  let {baseUrl} = config;
  const unminifiedFiles = baseUrl.startsWith('http://localhost');
  const ext =
    type === 'css' ? 'css' : config.binary === 'no-modules' ? 'js' : 'mjs';

  // v0.js
  if (module === 'amp') {
    return getRtvUrl(`/${unminifiedFiles ? 'amp' : 'v0'}.${ext}`, config);
  }

  // Extension.
  return getRtvUrl(
    `/v0/${module}-${version || '0.1'}${unminifiedFiles ? '.max' : ''}.${ext}`,
    config
  );
}

function getAmpToggleExperimentsScript(experiments): HtmlChildren {
  if (!experiments?.length) {
    return null;
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
  version?: string,
  attrs?: string
): HtmlChildren {
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
      ${attrs}
      src="${getAmpUrl(name, version, 'js', config)}"
    ></script>
  `;
}

export function getAmphtmlHeadContent(
  tree: VNode,
  config: Config,
  parameters?: AmpParameters
): HtmlChildren {
  return [
    maybeGenerateCspHashMeta(collectInlineAmpScripts(tree)),
    maybeGetBaseHref(config),
    get3pIframeMeta(config),
    getAmpToggleExperimentsScript(parameters?.experiments),
    getAmpScriptAndStylesheet(config, 'amp'),
    `<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>`,
    parameters?.extensions?.map(({name, version}) =>
      getAmpScriptAndStylesheet(
        config,
        name,
        version,
        `custom-${getExtType(name)}="${name}"`
      )
    ),
    getStyleAmpCustom(tree),
  ];
}
