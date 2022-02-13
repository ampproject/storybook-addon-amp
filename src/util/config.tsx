import {AddonName} from '../addon';

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
    rethrowAsync(e as Error);
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
    rethrowAsync(e as Error);
  }
}

function rethrowAsync(e: Error) {
  setTimeout(() => {
    throw e;
  });
}
