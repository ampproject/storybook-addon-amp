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

import { makeDecorator } from "@storybook/addons";

import { ParameterName } from "./addon";
import PreactDecorator from "./register/components/PreactDecorator";

export const withAmp = makeDecorator({
  name: "withAmp",
  parameterName: ParameterName,
  skipIfNoParametersOrOptions: false,
  wrapper: PreactDecorator, // TODO: Implement React and Vue.js deocrators
});

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}
