import {addParameters} from '@storybook/preact';

addParameters({
  // "Local" URL prefix to fetch JS files for a specific build (eg. dev server)
  localBaseUrl: "https://localhost:8000/dist",

  // Binary files are named differently than the CDN when running the local dev
  // server. If the localBaseUrl points to a local dev server, set this to true
  // (default). Otherwise, JS file paths are like the CDN.
  // 
  // localAlternateNames:
  //      true   amp.js   amp-list-0.1.max.js   ...
  //      false  v0.js    amp-list-0.1.js       ...
  localAlternateNames: true,
});
