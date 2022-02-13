export function encodeHtmlEntities(string: string): string {
  return string.replace(
    /[\u00A0-\u9999<>\&]/g,
    (i) => "&#" + i.charCodeAt(0) + ";"
  );
}
