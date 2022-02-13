export type HtmlWrapperOptions = {
  title?: string;
  head?: HtmlChildren;
  htmlOpenTag?: string;
};

export type HtmlChildren = HtmlChildren[] | string | null | undefined | false;

export function encodeHtmlEntities(string: string): string {
  return string.replace(
    /[\u00A0-\u9999<>\&]/g,
    (i) => '&#' + i.charCodeAt(0) + ';'
  );
}

export function getHtmlWrapper({
  title,
  head,
  htmlOpenTag = '<html>',
}: HtmlWrapperOptions) {
  return /* HTML */ `
    <!DOCTYPE html>
    ${htmlOpenTag}
      <head>
        <meta charset="utf-8" />
        ${title ? /* HTML */ `<title>${encodeHtmlEntities(title)}</title>` : ''}
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,initial-scale=1"
        />
        ${flattenHtmlChildren(head)}
      </head>
      <body></body>
    </html>
  `;
}

function flattenHtmlChildren(children: HtmlChildren): string {
  if (!children) {
    return '';
  }
  if (typeof children === 'string') {
    return children;
  }
  return children.flat().filter(Boolean).join('\n');
}
