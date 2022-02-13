/** @jsx jsx */
import addons from '@storybook/addons';
import {jsx} from '@storybook/theming';

import {AddonName, PanelName} from '../addon';

import {ConfigPanel} from './components/ConfigPanel';

addons.register(AddonName, (api) => {
  addons.addPanel(PanelName, {
    title: 'AMP',
    render({active = false, key}) {
      return (
        <ConfigPanel
          key={key}
          channel={addons.getChannel()}
          api={api}
          active={active}
        />
      );
    },
  });
});
