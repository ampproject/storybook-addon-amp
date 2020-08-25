/** @jsx h */
import { h } from 'preact';
import {storiesOf} from '@storybook/preact';
import {withAmp} from '../esm';
import {text, withKnobs} from '@storybook/addon-knobs';

storiesOf('amp-base-carousel-1.0', module)
  .addDecorator(withKnobs)
  .addDecorator(withAmp)
  .addParameters({
    extensions: [{name: 'amp-base-carousel', version: '1.0'}],
    experiments: ['amp-base-carousel-bento'],
  })
  .add('default', () => {
    const slide1 = text('slide1', 'lightcoral');
    return (
      <amp-base-carousel width="440" height="225">
        {[slide1, 'peachpuff', 'lavender'].map((color) => (
          <div key={color}>{color}</div>
        ))}
      </amp-base-carousel>
    );
  });
