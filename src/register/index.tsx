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

/** @jsx jsx */
import addons from "@storybook/addons";
import { jsx } from "@storybook/theming";

import { AddonName, PanelName } from "../addon";

import { Wrapper } from "./components/Wrapper";

addons.register(AddonName, (api) => {
  addons.addPanel(PanelName, {
    title: "AMP",
    render({ active = false, key }) {
      return (
        <Wrapper
          key={key}
          channel={addons.getChannel()}
          api={api}
          active={active}
        />
      );
    },
  });
});
