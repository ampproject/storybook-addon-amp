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

/** @jsx h */
import { h } from "preact";
import { useEffect } from "@storybook/client-api";
import { render } from "preact";
import type { RefObject } from "react";
import type { Config } from "./config";
import type { StoryContext, StoryGetter } from "@storybook/addons";

export function useBentoMode(
  ref: RefObject<HTMLDivElement>,
  config: Config,
  ampHtml: string,
  getStory: StoryGetter,
  context: StoryContext
) {
  useEffect(() => {
    if (config.mode !== 'bento') {
      return;
    }

    // Preact mode, unfortunately, completely rerenders the content
    // (e.g. iframe), which forces the reload making it impossible to test
    // Bento mode. Thus, this code only renders the placeholder element and
    // the iframe is created and reused in the `useBentoMode`.
    // See https://github.com/storybookjs/storybook/issues/12177
    const placeholder = ref?.current;
    const parent = placeholder?.parentElement;
    if (!placeholder || !parent) {
      return;
    }
    let iframe = parent.querySelector('#amp-iframe') as HTMLIFrameElement|null;
    if (!iframe) {
      const doc = parent.ownerDocument;
      iframe = doc.createElement("iframe") as HTMLIFrameElement;
      iframe.id = 'amp-iframe';
      iframe.setAttribute("title", "AMP Document container");
      iframe.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        background-color: #fff;
      `;

      const blob = new Blob([ampHtml], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      iframe.src = blobUrl;
      parent.appendChild(iframe);
    }

    const readyPromise = new Promise((resolve) => {
      const isReady = () => {
        const iframeDoc = iframe!.contentDocument;
        return (
          iframeDoc &&
          iframeDoc.readyState == 'complete' &&
          iframeDoc.documentElement.hasAttribute('amp')
        );
      };

      if (isReady()) {
        resolve();
      } else {
        const interval = setInterval(() => {
          if (isReady()) {
            resolve();
            clearInterval(interval);
          }
        }, 10);
      }
    });
    readyPromise.then(() => {
      const iframeDoc = iframe!.contentDocument!;
      render(getStory(context), iframeDoc.body);
    });
  });
}
