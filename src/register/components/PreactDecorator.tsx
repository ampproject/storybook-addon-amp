/** @jsx h */
import {h} from 'preact';
import {renderToString as preactRenderToString} from 'preact-render-to-string';
import {useEffect, useRef, useState} from '@storybook/client-api';
import addons, {StoryWrapper} from '@storybook/addons';
import {Events} from '../../addon';
import {Config, defaultConfig, sameConfig} from '../../util/config';
import {useBentoMode} from './bento';
import {wrapAmpHtml} from '../../util/amphtml';

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

  const tree = getStory(context) as preact.VNode;
  const html = wrapAmpHtml(tree, config, context);
  const ref = useRef<HTMLDivElement | null>(null);

  // TODO(alanorozco): Figure out this `useBentoMode` business. This is not
  // used on amphtml's config of the addon.
  useBentoMode(ref, config, html, getStory, context);
  if (config.mode === 'bento') {
    // Preact mode, unfortunately, completely rerenders the content
    // (e.g. iframe), which forces the reload making it impossible to test
    // Bento mode. Thus, this code only renders the placeholder element and
    // the iframe is created and reused in the `useBentoMode`.
    // See https://github.com/storybookjs/storybook/issues/12177
    return <div ref={ref} />;
  }

  // ampdoc mode: reload the iframe.
  const contents = preactRenderToString(tree);
  const fullContent = html.replace('<body></body>', contents);
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

export default Decorator;
