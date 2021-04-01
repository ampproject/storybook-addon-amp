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
import { text, withKnobs } from '@storybook/addon-knobs';

export default {
  title: 'amp-base-carousel-1.0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{ name: 'amp-base-carousel', version: '1.0' }],
    experiments: ['bento'],
  },
};

export const Default = () => {
  const slide1 = text('slide1', 'lightcoral');
  return (
    <amp-base-carousel width="440" height="225">
      {[slide1, 'peachpuff', 'lavender'].map((color) => (
        <div key={color}>{color}</div>
      ))}
    </amp-base-carousel>
  );
};

Default.story = {
  name: 'default',
};

export const Other = () => {
  return (
    <amp-base-carousel width="440" height="225">
      {['peachpuff', 'lavender'].map((color) => (
        <div key={color}>{color}</div>
      ))}
    </amp-base-carousel>
  );
};

Other.story = {
  name: 'other',
};
