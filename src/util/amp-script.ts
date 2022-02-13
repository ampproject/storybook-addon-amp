/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {createHash} from 'crypto';
import {collectNodes} from './vnode';

export function generateCspHash(script) {
  const hash = createHash('sha384');
  const data = hash.update(script, 'utf8');

  return (
    'sha384-' +
    data
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  );
}

export function collectInlineAmpScripts(
  tree: preact.VNode<{target?: string}>
): string[] {
  return collectNodes(
    tree,
    (node) =>
      node?.type === 'script' &&
      node?.props?.target === 'amp-script' &&
      typeof node?.props?.children === 'string'
  ).map(({props}) => props.children) as string[];
}

export function maybeGenerateCspHashMeta(scripts: string[]) {
  if (scripts.length < 1) {
    return '';
  }
  return `<meta name="amp-script-src" content="${scripts
    .map((script) => generateCspHash(script))
    .join(' ')}" />`;
}
