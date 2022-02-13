import {makeDecorator} from '@storybook/addons';

import {ParameterName} from './addon';
import {AmphtmlWrapper, BentoWrapper, PlainWrapper} from './register/wrappers';

export const withAmp = makeDecorator({
  name: 'withAmp',
  parameterName: ParameterName,
  skipIfNoParametersOrOptions: false,
  wrapper: AmphtmlWrapper,
});

export const withBento = makeDecorator({
  name: 'withBento',
  parameterName: ParameterName,
  skipIfNoParametersOrOptions: false,
  wrapper: BentoWrapper,
});

export const withIframe = makeDecorator({
  name: 'withIframe',
  parameterName: ParameterName,
  skipIfNoParametersOrOptions: false,
  wrapper: PlainWrapper,
});

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}
