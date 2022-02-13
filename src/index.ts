import {makeDecorator} from '@storybook/addons';

import {ParameterName} from './addon';
import PreactDecorator from './register/components/PreactDecorator';

export const withAmp = makeDecorator({
  name: 'withAmp',
  parameterName: ParameterName,
  skipIfNoParametersOrOptions: false,
  wrapper: PreactDecorator, // TODO: Implement React and Vue.js deocrators
});

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}
