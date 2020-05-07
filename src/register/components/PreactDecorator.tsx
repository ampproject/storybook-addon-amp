/** @jsx h */
import {h} from 'preact'
import flush from 'styled-jsx/server';
import {renderToString as preactRenderToString} from 'preact-render-to-string';

import  { StoryWrapper } from '@storybook/addons'

export const Decorator: StoryWrapper = (getStory, context, { parameters }) => {
    const contents = preactRenderToString(getStory(context));
    const styleElements = flush();
    const styles = preactRenderToString(
      <style
        amp-custom=""
        dangerouslySetInnerHTML={{
          __html: styleElements
            .map((style: React.ReactElement) => style.props.dangerouslySetInnerHTML.__html)
            .join('')
            .replace(/\/\*# sourceMappingURL=.*\*\//g, '')
            .replace(/\/\*@ sourceURL=.*?\*\//g, ''),
        }}
      />
    );

    const ampHtml = `
        <!doctype html>
        <html amp lang="en">
        <head>
            <meta charSet="utf-8" />
            <title>AMP Page Example</title>
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
            ${(context?.parameters?.extensions || []).map(
              (ext) =>
                `<script async custom-element="${
                  ext.name
                }" src="https://cdn.ampproject.org/v0/${ext.name}-${
                  ext.version || 0.1
                }.js"></script>`
            )}
            ${styles}
        </head>
        <body>
            ${contents}
        </body>
        </html>
    `;
    const blob = new Blob([ampHtml], {type: 'text/html'});

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
  }

  export default Decorator