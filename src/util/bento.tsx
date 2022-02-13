/** @jsx h */
import {h} from 'preact';
import {Config} from './config';
import {HtmlChildren} from './html';
import type {VNode} from 'preact';
import {getRtvUrl} from './cdn-url';

function maybeGetBaseHref(config: Config): HtmlChildren {
  if (!config.baseUrl.startsWith('http://localhost')) {
    return null;
  }
  return `<base href="${new URL(config.baseUrl).origin}">`;
}

function getLinkRelStylesheet(path: string, config: Config): HtmlChildren {
  return /* HTML */ `
    <link
      rel="stylesheet"
      href="${getRtvUrl(path, config)}"
      crossorigin="anonymous"
    />
  `;
}

function getScripts(basename: string, config: Config): HtmlChildren {
  return /* HTML */ `
    <script
      type="module"
      src="${getRtvUrl(`${basename}.mjs`, config)}"
      crossorigin="anonymous"
    ></script>
    <script
      nomodule
      src="${getRtvUrl(`${basename}.js`, config)}"
      crossorigin="anonymous"
    ></script>
  `;
}

function getComponentScriptsAndStyle(
  name: string,
  version: string,
  config: Config
): HtmlChildren {
  return [
    getScripts(`v0/${name}-${version}`, config),
    getLinkRelStylesheet(`v0/${name}-${version}.css`, config),
  ];
}

export function getBentoHeadContent(
  tree: VNode,
  config: Config,
  parameters?: {[string: string]: any}
): HtmlChildren {
  return [
    maybeGetBaseHref(config),
    getScripts('bento', config),
    parameters?.components?.map(({name, version}) =>
      getComponentScriptsAndStyle(name, version, config)
    ),
  ];
}
