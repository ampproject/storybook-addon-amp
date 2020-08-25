
export interface Config {
  mode: string;
  binary: string;
  source: string;
}

export const defaultConfig: Config = {
  mode: "ampdoc", // "ampdoc", "bento"
  binary: "no-modules", // "no-modules", "modules"
  source: "cdn", // "cdn", "local"
};
