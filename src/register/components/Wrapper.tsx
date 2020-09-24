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
import { Fragment, SFC, useEffect, useState, useCallback, useRef } from "react";
import { jsx, styled } from "@storybook/theming";
import addons from "@storybook/addons";
import { STORY_CHANGED } from "@storybook/core-events";

import { ScrollArea, Form } from "@storybook/components";

import { Events, ParameterName } from "../../addon";
import {Config, getPersistedConfig, persistConfig} from "./config";

const PanelWrapper = styled(({ children, className }) => (
  <ScrollArea horizontal vertical className={className}>
    {children}
  </ScrollArea>
))({
  height: "100%",
  width: "100%",
  padding: "16px",
  justifyContent: "center",
});

interface Props {
  channel: ReturnType<typeof addons["getChannel"]>;
  api: any;
  active: boolean;
}

export const Wrapper: SFC<Props> = ({ active, api, channel }) => {
  const [config, setConfig] = useState<Config>(getPersistedConfig);
  const configRef = useRef(config);
  configRef.current = config;

  const updateConfig = useCallback(
    (newConfig) => {
      setConfig(newConfig);
      persistConfig(newConfig);
      api.emit(Events.UpdateConfig, newConfig);
    },
    [setConfig]
  );

  useEffect(() => {
    const onStoryChanged = () => {
      api.emit(Events.UpdateConfig, configRef.current);
    };

    channel.on(STORY_CHANGED, onStoryChanged);
    channel.on(Events.AskConfig, onStoryChanged);
    
    return () => {
      channel.removeListener(STORY_CHANGED, onStoryChanged);
      channel.removeListener(Events.AskConfig, onStoryChanged);
    };
  }, []);

  if (!active) {
    return null;
  }

  return (
    <Fragment>
      <PanelWrapper>
        <svg
          width="175"
          height="60"
          viewBox="0 0 175 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>AMP-Brand-Blue</title>
          <g fill="#005af0" fillRule="evenodd">
            <path d="M92.938 34.265h7.07l-2.38-7.015c-.153-.445-.334-.97-.54-1.574-.21-.603-.414-1.256-.615-1.96-.188.715-.384 1.378-.585 1.988-.202.61-.392 1.136-.57 1.58l-2.38 6.98zm16.632 9.794h-4.656c-.522 0-.95-.122-1.29-.362-.336-.24-.57-.548-.7-.923l-1.528-4.465h-9.844l-1.53 4.465c-.116.328-.348.625-.69.888-.344.264-.765.396-1.263.396h-4.692L93.4 18.44h6.147L109.57 44.06zM130.562 33.736c.22.48.43.975.63 1.48.202-.518.415-1.02.64-1.505.225-.487.456-.96.693-1.416l6.645-12.954c.12-.224.24-.397.365-.52.124-.123.264-.214.417-.273.154-.06.33-.088.524-.088h5.27v25.6h-5.295V29.324c0-.714.035-1.49.106-2.32l-6.858 13.168c-.213.41-.5.72-.862.932-.362.21-.773.316-1.235.316h-.816c-.462 0-.873-.104-1.235-.315-.363-.21-.65-.52-.864-.932l-6.893-13.187c.047.41.083.818.106 1.222.023.405.035.778.035 1.117V44.06h-5.295v-25.6h5.269c.194 0 .37.028.523.087.154.06.293.15.417.274.125.123.246.296.365.52l6.663 13.006c.237.446.464.91.684 1.39M160.99 31.013h3.127c1.563 0 2.688-.37 3.376-1.108.687-.738 1.03-1.77 1.03-3.094 0-.585-.088-1.12-.266-1.6-.178-.48-.448-.893-.808-1.24-.363-.344-.82-.612-1.37-.8-.55-.187-1.206-.28-1.963-.28h-3.127v8.123zm0 4.483v8.562h-6.006V18.442h9.133c1.824 0 3.39.214 4.7.64 1.308.43 2.387 1.018 3.233 1.77.847.75 1.473 1.634 1.875 2.653.403 1.02.604 2.122.604 3.306 0 1.278-.208 2.45-.622 3.518-.416 1.065-1.05 1.98-1.902 2.742-.853.762-1.934 1.357-3.243 1.784-1.308.43-2.857.642-4.646.642h-3.127zM40.674 27.253L27.968 48.196h-2.302l2.276-13.647-7.048.01h-.1c-.633 0-1.148-.51-1.148-1.137 0-.27.254-.727.254-.727l12.664-20.92 2.34.01-2.332 13.668 7.084-.008.112-.002c.635 0 1.15.51 1.15 1.14 0 .254-.1.478-.245.668zM30.288 0C13.56 0 0 13.432 0 30 0 46.57 13.56 60 30.288 60c16.73 0 30.29-13.431 30.29-30 0-16.568-13.56-30-30.29-30z" />
          </g>
        </svg>
        <Form>
          <Form.Field key={"source"} label={"Source"}>
            <Form.Select
              value={config?.source}
              name={"source"}
              onChange={(e) => {
                updateConfig({ ...config, source: e.target.value, binary: "no-modules" });
              }}
              size="flex"
            >
              <option key={"cdn"} value={"cdn"}>
                {"cdn.ampproject.org"}
              </option>
              <option key={"local"} value={"local"}>
                {"localhost"}
              </option>
            </Form.Select>
          </Form.Field>
          <Form.Field key={"binary"} label={"Binary"}>
            <Form.Select
              value={config?.binary}
              name={"binary"}
              onChange={(e) => {
                updateConfig({ ...config, binary: e.target.value });
              }}
              size="flex"
            >
              <option key={"no-modules"} value={"no-modules"}>
                {"v0.js (nomodule)"}
              </option>
              <option key={"modules"} value={"modules"}>
                {"v0.mjs (type=\"module\")"}
              </option>
            </Form.Select>
          </Form.Field>
          <Form.Field key={"mode"} label={"Mode"}>
            <Form.Select
              value={config?.mode}
              name={"mode"}
              onChange={(e) => {
                updateConfig({ ...config, mode: e.target.value });
              }}
              size="flex"
            >
              <option key={"ampdoc"} value={"ampdoc"}>
                {"AMP"}
              </option>
              <option key={"bento"} value={"bento"}>
                {"Bento"}
              </option>
            </Form.Select>
          </Form.Field>
        </Form>
      </PanelWrapper>
    </Fragment>
  );
};

export default Wrapper;
