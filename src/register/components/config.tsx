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

import {AddonName} from '../../addon';

export interface Config {
  mode: string;
  binary: string;
  baseUrl: string;
  rtv: string;
}

export const SOURCE_BASE_URL: {[label: string]: string} = {
  cdn: 'https://cdn.ampproject.org/',
  local: 'http://localhost:8000/dist',
};

export const defaultConfig: Config = {
  mode: 'ampdoc', // "ampdoc", "bento"
  binary: 'no-modules', // "no-modules", "modules"
  baseUrl: SOURCE_BASE_URL.cdn,
  rtv: '',
};

const STORAGE_NAME = `${AddonName}.config`;

export function sameConfig(c1: Config, c2: Config): boolean {
  return (
    c1.mode === c2.mode &&
    c1.binary === c2.binary &&
    c1.baseUrl === c2.baseUrl &&
    c1.rtv === c2.rtv
  );
}

export function getPersistedConfig(): Config {
  try {
    const stored = localStorage.getItem(STORAGE_NAME);
    if (!stored) {
      return defaultConfig;
    }
    const parsed = JSON.parse(stored);
    return {
      ...defaultConfig,
      mode: parsed['mode'],
      binary: parsed['binary'],
      baseUrl: parsed['baseUrl'] || SOURCE_BASE_URL[parsed['source']],
      rtv: parsed['rtv'],
    };
  } catch (e) {
    rethrowAsync(e);
  }
  return defaultConfig;
}

export function persistConfig(config: Config) {
  try {
    localStorage.setItem(
      STORAGE_NAME,
      JSON.stringify({
        mode: config.mode,
        binary: config.binary,
        baseUrl: config.baseUrl,
        rtv: config.rtv,
      })
    );
  } catch (e) {
    rethrowAsync(e);
  }
}

function rethrowAsync(e: Error) {
  setTimeout(() => {
    throw e;
  });
}
