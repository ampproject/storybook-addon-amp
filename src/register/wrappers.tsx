/** @jsx h */
import {h} from 'preact';
import {renderToString as preactRenderToString} from 'preact-render-to-string';
import {useEffect, useRef, useState} from '@storybook/client-api';
import addons, {StoryWrapper} from '@storybook/addons';
import {Events} from '../addon';
import {Config, defaultConfig, sameConfig} from '../util/config';
import {getAmphtmlHeadContent} from '../util/amp';
import {getHtmlWrapper, HtmlWrapperOptions} from '../util/html';
import {getBentoHeadContent} from '../util/bento';
import type {VNode} from 'preact';

function useSetDocumentType(type: 'amp' | 'bento') {
  useEffect(() => {
    const channel = addons.getChannel();
    channel.emit(Events.UpdateDocumentType, type);
  }, [type]);
}

function useReadConfig(): Config {
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

  return config;
}

function renderSrcBlobIframe(
  tree: VNode,
  htmlWrapperOptions: HtmlWrapperOptions
): VNode {
  const html = getHtmlWrapper({...htmlWrapperOptions});
  const contents = preactRenderToString(tree);
  const fullContent = html.replace('<body></body>', contents);
  const blob = new Blob([fullContent], {type: 'text/html'});
  return (
    <iframe
      src={URL.createObjectURL(blob)}
      title={htmlWrapperOptions.title}
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
}

export const AmphtmlWrapper: StoryWrapper = (getStory, context) => {
  const tree = getStory(context) as VNode;
  const config = useReadConfig();
  useSetDocumentType('amp');
  return renderSrcBlobIframe(tree, {
    title: context.title,
    htmlOpenTag: '<html amp lang="en">',
    head: getAmphtmlHeadContent(tree, config, context.parameters),
  });
};

export const BentoWrapper: StoryWrapper = (getStory, context) => {
  const tree = getStory(context) as VNode;
  const config = useReadConfig();
  useSetDocumentType('bento');
  return renderSrcBlobIframe(tree, {
    title: context.title,
    htmlOpenTag: '<html lang="en">',
    head: getBentoHeadContent(tree, config, context.parameters),
  });
};

export const PlainWrapper: StoryWrapper = (getStory, context) => {
  const tree = getStory(context) as VNode;
  useSetDocumentType('bento');
  return renderSrcBlobIframe(tree, {
    title: context.title,
  });
};
