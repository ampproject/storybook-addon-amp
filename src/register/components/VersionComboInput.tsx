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
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { jsx, styled } from "@storybook/theming";
import { Form } from "@storybook/components";

const largestWithPrefix = (
  prefix: string,
  values: string[]
): string | undefined =>
  values
    .filter((value) => value.startsWith(prefix))
    .sort()
    .pop();

const numericRe = /^[0-9]*$/;

function valueExistsInDict(object, value) {
  for (const key in object) {
    if (object[key] === value) {
      return true;
    }
  }
  return false;
}

const isValidRtv = (value) =>
  (value.length === 15 /* valid RTV length */ || value.length === 0) &&
  numericRe.test(value);

const VersionComboInputContainer = styled.div({
  alignItems: "center",
  flex: 1,
  display: "flex",
});

const VersionSelect = styled(Form.Select)({
  marginRight: 6,
  maxWidth: 140,
});

const VersionInput = styled(Form.Input)({
  fontFamily: "Menlo, Consolas, monospace",
  maxWidth: 180,
});

function fetchChannelRtvs(): Promise<{ [label: string]: string | undefined }> {
  return fetch("https://cdn.ampproject.org/rtv/metadata")
    .then((r) => r.json())
    .then(({ ampRuntimeVersion, ltsRuntimeVersion, diversions }) => ({
      LTS: ltsRuntimeVersion,
      stable: ampRuntimeVersion,
      control: largestWithPrefix("02", diversions),
      beta: largestWithPrefix("03", diversions),
      experimental: largestWithPrefix("00", diversions),
      nightly: largestWithPrefix("04", diversions),
    }));
}

export const VersionComboInput = ({ onChange, defaultValue, ...rest }) => {
  const [channelRtvs, setChannelRtvs] = useState<{
    [label: string]: string | undefined;
  }>({});
  const [value, setValue] = useState(defaultValue);

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const channels = useMemo(
    () =>
      Object.keys(channelRtvs).map((label) =>
        channelRtvs[label] ? (
          <option key={label} value={channelRtvs[label]}>
            {label}
          </option>
        ) : (
          ""
        )
      ),
    [channelRtvs]
  );

  const updateValue = useCallback(
    (value) => {
      if (isValidRtv(value)) {
        onChange({ currentTarget: { value } });
      }
      if (inputRef.current) {
        inputRef.current.value = value;
      }
      if (selectRef.current) {
        selectRef.current.value = valueExistsInDict(channelRtvs, value)
          ? value
          : "";
      }
      setValue(value);
    },
    [onChange]
  );

  useEffect(() => {
    fetchChannelRtvs().then((labeled) => setChannelRtvs(labeled));
  }, []);

  return (
    <VersionComboInputContainer>
      <VersionSelect
        ref={selectRef}
        size="flex"
        defaultValue={value}
        onChange={(e) => {
          updateValue(e.target.value);
          inputRef.current?.focus();
        }}
      >
        <option value="">by RTV</option>
        <optgroup label="channels">{channels}</optgroup>
      </VersionSelect>
      <VersionInput
        {...rest}
        defaultValue={defaultValue}
        ref={inputRef}
        size="flex"
        onChange={(e) => {
          updateValue(e.currentTarget.value);
        }}
      />
      {value.length === 0 && (
        <div style={{ marginLeft: 6 }}>
          <a href="https://cdn.ampproject.org/experiments.html">set opt-in</a>
        </div>
      )}
    </VersionComboInputContainer>
  );
};
