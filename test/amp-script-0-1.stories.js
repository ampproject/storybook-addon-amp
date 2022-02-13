/** @jsx h */
import {h} from 'preact';
import {withAmp} from '../esm';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-script-0.1',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-script', version: '0.1'}],
  },
};

export const AmpScript = () => (
  <div>
    Open console, see "amp-script executed".
    <amp-script id="dataFunctions" script="local-script" nodom></amp-script>
    <script id="local-script" type="text/plain" target="amp-script">
      {`
        console.log('amp-script executed');
        `}
    </script>
  </div>
);

AmpScript.story = {
  name: 'amp-script',
};
