export interface AmpParameters {
  extensions?: {name: string; version: string}[];
  experiments?: string[];
}

export const AddonName = 'storybook/amp';
export const PanelName = `${AddonName}/panel`;

export const Events = {
  UpdateDocumentType: `${AddonName}/update_document_type`,
  UpdateConfig: `${AddonName}/update_config`,
  AskConfig: `${AddonName}/ask_config`,
};

export const ParameterName = 'amp';
