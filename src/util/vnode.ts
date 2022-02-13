import type {VNode} from 'preact';

export function collectNodes<T>(
  tree: VNode<T> | null | void,
  filter: (node: VNode<T>) => boolean,
  clear = false
): VNode<T>[] {
  const collected: VNode<T>[] = [];
  if (!tree) {
    return collected;
  }
  const children = tree.props.children;
  if (!Array.isArray(children)) {
    const child = children as VNode<T>;
    if (filter(children as VNode<T>)) {
      collected.push(child);
      if (clear) {
        tree.props.children = null;
      }
    }
  } else {
    for (const [i, child] of (children as VNode<T>[]).entries()) {
      if (filter(child)) {
        collected.push(child);
        if (clear) {
          children[i] = null;
        }
      } else {
        collected.push(...collectNodes(child, filter, clear));
      }
    }
  }
  return collected;
}
