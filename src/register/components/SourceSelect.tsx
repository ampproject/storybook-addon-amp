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
import { FunctionComponent, useMemo } from "react";
import { Form } from "@storybook/components";
import { jsx } from "@storybook/theming";
import { SOURCE_BASE_URL } from "./config";
import { useParameter } from "@storybook/addons";

export const SourceSelect: FunctionComponent<{
  onChange: (InputEvent) => void;
  value: string;
  ampBaseUrlOptions: string[];
}> = ({ onChange, value, ampBaseUrlOptions }) => {
  const options = useMemo(() => {
    const options = [SOURCE_BASE_URL.cdn];
    if (window.location.hostname !== SOURCE_BASE_URL.cdn) {
      options.push(SOURCE_BASE_URL.local);
    }
    return [...options, ...ampBaseUrlOptions].map((url) => new URL(url));
  }, [ampBaseUrlOptions]);

  return (
    <Form.Select
      name="Source"
      size="flex"
      disabled={options.length === 1 && options[0].href === value}
      value={value}
      onChange={onChange}
    >
      {options.map(({ href, hostname }) => (
        <option key={href} value={href}>
          {hostname}
        </option>
      ))}
    </Form.Select>
  );
};
