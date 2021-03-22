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
import flush from "styled-jsx/server";
import { renderToString as preactRenderToString } from "preact-render-to-string";
import { useEffect, useRef, useState } from "@storybook/client-api";
import addons, { StoryWrapper } from "@storybook/addons";

import { Events } from "../../addon";
import { SOURCE_BASE_URL, Config, defaultConfig, sameConfig } from "./config";
import { useBentoMode } from "./bento";

const EXT_TYPES = {
  'amp-mustache': 'template',
};

export const Decorator: StoryWrapper = (getStory, context, { parameters }) => {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const configRef = useRef<Config>(config);
  configRef.current = config;

  useEffect(() => {
    const channel = addons.getChannel();
    channel.emit(Events.AskConfig);

    const onUpdatedConfig = (config) => {
      if (!sameConfig(config, configRef.current)) {
        setConfig(config);
      }
    };
    channel.on(Events.UpdateConfig, onUpdatedConfig);
    return () => {
      channel.removeListener(Events.UpdateConfig, onUpdatedConfig);
    };
  }, []);

  const contents = preactRenderToString(getStory(context));
  const styleElements = flush();
  const styles = preactRenderToString(
    <style
      amp-custom=""
      dangerouslySetInnerHTML={{
        __html: styleElements
          .map(
            (style: React.ReactElement) =>
              style.props.dangerouslySetInnerHTML.__html
          )
          .join("")
          .replace(/\/\*# sourceMappingURL=.*\*\//g, "")
          .replace(/\/\*@ sourceURL=.*?\*\//g, ""),
      }}
    />
  );

  const ampHtml = `
        <!doctype html>
        <html amp lang="en">
        <head>
            <meta charSet="utf-8" />
            <title>AMP Page Example</title>
            <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
            ${getBase(config)}
            ${get3pIframeMeta(config)}
            ${
              context?.parameters?.experiments?.length > 0 ?
              `<script>
                (window.AMP = window.AMP || []).push(function (AMP) {
                  ${(context.parameters.experiments).map(
                    (exp) =>
                      `AMP.toggleExperiment('${exp}', true, true);`
                  ).join('')}
                });
              </script>` :
              ""
            }
            ${
              config.binary === "modules" ?
              `<link rel="stylesheet" href="${getAmpUrl("amp", null, "css", config)}">` :
              ""
            }
            <script async src="${getAmpUrl("amp", null, "js", config)}"></script>
            <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
            ${(context?.parameters?.extensions || []).map(
              (ext) =>
                `
                ${
                  config.binary === "modules" ?
                  `<link rel="stylesheet" href="${getAmpUrl(ext.name, ext.version, "css", config)}">` :
                  ""
                }
                <script async custom-${getExtType(ext.name)}="${
                  ext.name
                }" src="${getAmpUrl(ext.name, ext.version, "js", config)}"></script>
                `
            ).join('')}
            ${styles}
        </head>
        <body></body>
        </html>
    `;

  const ref = useRef<HTMLDivElement|null>(null);
  useBentoMode(ref, config, ampHtml, getStory, context);
  if (config.mode === "bento") {
    // Preact mode, unfortunately, completely rerenders the content
    // (e.g. iframe), which forces the reload making it impossible to test
    // Bento mode. Thus, this code only renders the placeholder element and
    // the iframe is created and reused in the `useBentoMode`.
    // See https://github.com/storybookjs/storybook/issues/12177
    return <div ref={ref}/>;
  }

  // ampdoc mode: reload the iframe.
  const fullContent = ampHtml.replace('<body></body>', contents);
  const blob = new Blob([fullContent], { type: "text/html" });
  return (
    <iframe
      src={URL.createObjectURL(blob)}
      title={"AMP Document container"}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
        backgroundColor: "#fff",
      }}
    />
  );
};

function getExtType(name: string) {
  return EXT_TYPES[name] || 'element';
}

function getBase(config: Config): string {
  if (!config.baseUrl.startsWith("http://localhost")) {
    return "";
  }
  return `<base href="${new URL(config.baseUrl).origin}">`;
}

function get3pIframeMeta(config: Config): string {
  if (!config.baseUrl.startsWith("http://localhost")) {
    return "";
  }
  const baseUrl3p = config.baseUrl.replace('//localhost', '//ads.localhost');
  const src3p = new URL('/dist.3p/current/frame.max.html', baseUrl3p).href;
  return `<meta name="amp-3p-iframe-src" content="${src3p}">`;
}

function getAmpUrl(
  module: string,
  version: string | null,
  type: string,
  config: Config,
): string {
  let {baseUrl} = config;
  const unminifiedFiles = baseUrl.startsWith('http://localhost');
  if (baseUrl === SOURCE_BASE_URL.cdn && config.rtv) {
    baseUrl += `/rtv/${config.rtv}`;
  }
  const ext =
    type === "css" ? "css" : config.binary === "no-modules" ? "js" : "mjs";

  // v0.js
  if (module === "amp") {
    return `${baseUrl}/${unminifiedFiles ? "amp" : "v0"}.${ext}`;
  }

  // Extension.
  return `${baseUrl}/v0/${module}-${version || "0.1"}${
    unminifiedFiles ? ".max" : ""
  }.${ext}`;
}

export default Decorator;
