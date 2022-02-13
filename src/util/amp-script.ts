import {createHash} from 'crypto';
import {collectNodes} from './vnode';

export function generateCspHash(script) {
  const hash = createHash('sha384');
  const data = hash.update(script, 'utf8');

  return (
    'sha384-' +
    data
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  );
}

export function collectInlineAmpScripts(
  tree: preact.VNode<{target?: string}>
): string[] {
  return collectNodes(
    tree,
    (node) =>
      node?.type === 'script' &&
      node?.props?.target === 'amp-script' &&
      typeof node?.props?.children === 'string'
  ).map(({props}) => props.children) as string[];
}

export function maybeGenerateCspHashMeta(scripts: string[]) {
  if (scripts.length < 1) {
    return '';
  }
  return `<meta name="amp-script-src" content="${scripts
    .map((script) => generateCspHash(script))
    .join(' ')}" />`;
}
