# @ampproject/storybook-addon

The storybook AMP addon allows rendering of AMP content inside the Storybook
environment.

`@ampproject/storybook-addon` allows switching between three AMP modes:
Module (`v0.js`), No-module (`v0.mjs`) and Bento. It also allows switching
between development mode (locally hosted `v0.js`) and production mode (CDN
hosted `v0.js`).

## Getting Started

First, add the `@ampproject/storybook-addon` to your project:

```sh
yarn add @ampproject/storybook-addon --dev
```

Second, register the `@ampproject/storybook-addon` to your
config (`.storybook/main.js`):

```js
module.exports = {
  addons: ['@ampproject/storybook-addon'],
};
```

## Writing storybooks

An AMP story uses `withAmp` decorator:

```js
import {h} from 'preact';
import {storiesOf} from '@storybook/preact';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-carousel',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-carousel', version: '0.2'}]},
  },
};

export const Default = () => {
  return (
    <amp-base-carousel width="440" height="225">
      {['lightcoral', 'peachpuff', 'lavender'].map((color) => (
        <div key={color}>{color}</div>
      ))}
    </amp-base-carousel>
  );
};
```

The following parameters can be specified:

1. `extensions: [{name, version}]` - a list of extensions to be installed.
2. `experiments: [string]` - a list of experiments to enabled.

### `amp-script` hashes

Inline scripts used by `amp-script` require a `<meta name="amp-script-src">` tag that includes [their content hash](https://amp.dev/documentation/components/amp-script/#calculating-the-script-hash).

This addon generates the script hash for stories that need it. The following works without writing the respective `<meta>` tag:

```js
export const UsingInlineScript = () => (
  <>
    <amp-script script="hello" nodom></amp-script>
    <script id="hello" type="text/plain" target="amp-script">
      {`console.log('Hello');`}
    </script>
  </>
);
```
