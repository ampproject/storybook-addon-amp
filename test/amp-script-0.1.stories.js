/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @jsx h */
import { h } from 'preact';
import { withAmp } from '../esm';
import { withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'amp-script-0.1',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{ name: 'amp-script', version: '0.1' }],
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
