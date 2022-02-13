/** @jsx h */
import {h} from 'preact';
import {renderToString as preactRenderToString} from 'preact-render-to-string';
import {useEffect, useRef, useState} from '@storybook/client-api';
import addons, {StoryWrapper} from '@storybook/addons';
import {Events} from '../../addon';
import {SOURCE_BASE_URL, Config, defaultConfig, sameConfig} from './config';
import {useBentoMode} from './bento';
import {
  collectInlineAmpScripts,
  maybeGenerateCspHashMeta,
} from '../../util/amp-script';
import {collectNodes} from '../../util/vnode';
import {encodeHtmlEntities} from '../../util/html';

const EXT_TYPES = {
  'amp-mustache': 'template',
};

export const Decorator: StoryWrapper = (getStory, context, {parameters}) => {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const configRef = useRef<Config>(config);
  configRef.current = config;

  useEffect(() => {
    const channel = addons.getChannel();
    channel.emit(Events.AskConfig);

    const onUpdatedConfig = (config) => {
      if (!sameConfig(config, configRef.current)) {
        setConfig(config);
      }
    };
    channel.on(Events.UpdateConfig, onUpdatedConfig);
    return () => {
      channel.removeListener(Events.UpdateConfig, onUpdatedConfig);
    };
  }, []);

  const storyTree = getStory(context) as preact.VNode;

  const inlineStyles = collectStyles(storyTree);
  const styles = preactRenderToString(
    <style
      amp-custom
      dangerouslySetInnerHTML={{__html: inlineStyles.join('\n')}}
    />
  );
  const contents = preactRenderToString(storyTree);

  const ampHtml = wrapAmpHtml(storyTree, config, context, [styles]);

  const ref = useRef<HTMLDivElement | null>(null);

  // TODO(alanorozco): Figure out this `useBentoMode` business. This is not
  // used on amphtml's config of the addon.
  useBentoMode(ref, config, ampHtml, getStory, context);
  if (config.mode === 'bento') {
    // Preact mode, unfortunately, completely rerenders the content
    // (e.g. iframe), which forces the reload making it impossible to test
    // Bento mode. Thus, this code only renders the placeholder element and
    // the iframe is created and reused in the `useBentoMode`.
    // See https://github.com/storybookjs/storybook/issues/12177
    return <div ref={ref} />;
  }

  // ampdoc mode: reload the iframe.
  const fullContent = ampHtml.replace('<body></body>', contents);
  const blob = new Blob([fullContent], {type: 'text/html'});
  return (
    <iframe
      src={URL.createObjectURL(blob)}
      title={'AMP Document container'}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: '#fff',
      }}
    />
  );
};

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

type StringOrFalsy = string | void | null | false;

function wrapAmpHtml(
  tree,
  config,
  context,
  head: StringOrFalsy | StringOrFalsy[]
) {
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
          head,
        ]
          .flat()
          .filter(Boolean)
          .join('')}
      </head>
      <body></body>
    </html>
  `;
}

export function collectStyles(tree: preact.VNode | null | void): string[] {
  return collectNodes(
    tree,
    (node) =>
      node?.type === 'style' && typeof node?.props?.children === 'string',
    /* clear */ true
  ).map(({props}) => props.children) as string[];
}

export default Decorator;
