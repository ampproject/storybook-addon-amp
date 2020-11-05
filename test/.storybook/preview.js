import {addParameters} from '@storybook/preact';
addParameters({
  // These are added as "source" options from which to load AMP binaries.
  ampBaseUrlOptions: ['https://this-404s-expected/custom/dist'],
});
