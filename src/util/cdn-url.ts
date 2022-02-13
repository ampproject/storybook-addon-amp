import {Config, SOURCE_BASE_URL} from './config';

export function getRtvBaseUrl(config: Config) {
  if (config.baseUrl === SOURCE_BASE_URL.cdn && config.rtv) {
    return `${config.baseUrl}/rtv/${config.rtv}`;
  }
  return config.baseUrl;
}

export function getRtvUrl(path: string, config: Config) {
  return `${getRtvBaseUrl(config)}/${path}`;
}
