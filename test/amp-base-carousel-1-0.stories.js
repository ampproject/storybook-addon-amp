/** @jsx h */
import {h} from 'preact';
import {withAmp} from '../esm';
import {text, withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-base-carousel-1.0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-base-carousel', version: '1.0'}],
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
