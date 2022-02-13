/** @jsx jsx */
import {FunctionComponent, useMemo} from 'react';
import {Form} from '@storybook/components';
import {jsx} from '@storybook/theming';
import {SOURCE_BASE_URL} from './config';

export const SourceSelect: FunctionComponent<{
  onChange: (InputEvent) => void;
  value: string;
  ampBaseUrlOptions: string[];
}> = ({onChange, value, ampBaseUrlOptions}) => {
  const options = useMemo<URL[]>(() => {
    const options = ampBaseUrlOptions.concat(SOURCE_BASE_URL.cdn);
    if (window.location.origin !== SOURCE_BASE_URL.cdn.replace(/\/$/, '')) {
      options.push(SOURCE_BASE_URL.local);
    }
    return options.map((url) => new URL(url));
  }, [ampBaseUrlOptions]);

  return (
    <Form.Select
      name="Source"
      size="flex"
      disabled={options.length === 1 && options[0].href === value}
      value={value}
      onChange={onChange}
      // TODO(alanorozco): TS is complaining without these props
      translate={null}
      onAuxClick={null}
      onAuxClickCapture={null}
    >
      {options.map(({href, hostname}) => (
        <option key={href} value={href}>
          {hostname}
        </option>
      ))}
    </Form.Select>
  );
};
