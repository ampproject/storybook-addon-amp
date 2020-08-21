/** @jsx h */
import { h } from "preact";
import { useEffect } from "@storybook/client-api";
import { render } from "preact";

export function useBentoMode(ref, config, ampHtml, getStory, context) {
  useEffect(() => {
    const placeholder = ref.current;
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
