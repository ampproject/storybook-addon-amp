module.exports = {
  stories: ['../**/*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-knobs/register',
    './register.js',
  ],
};
