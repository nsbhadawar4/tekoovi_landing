/* -------------------------------------------------------------- */
/*  HTML sanitiser for editor content.                             */
/*                                                                 */
/*  Post and page bodies are stored as HTML and rendered with      */
/*  dangerouslySetInnerHTML, so what goes in has to be cleaned     */
/*  first. This is an allow-list: anything not named here is       */
/*  removed, which fails safe as the editor grows.                 */
/* -------------------------------------------------------------- */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "code", "pre",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "hr",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "span", "div",
]);

/** Per-tag attribute allow-list. Everything else is dropped. */
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  th: new Set(["colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
};

/** Schemes a link or image may use. `javascript:` is the one that matters. */
function safeUrl(value: string): boolean {
  const url = value.trim().toLowerCase();
  if (url.startsWith("javascript:") || url.startsWith("vbscript:")) return false;
  // data: URLs are allowed for images only, and only for real image types.
  if (url.startsWith("data:")) return url.startsWith("data:image/");
  return true;
}

/**
 * Strip everything not on the allow-list.
 *
 * Deliberately conservative: script, style, iframe, event handlers and unknown
 * tags all go. Text inside a removed tag is kept, so nothing silently vanishes
 * from a body that used an unsupported wrapper.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  let html = input;

  // Elements whose *content* is dangerous, not just the tag.
  html = html.replace(
    /<(script|style|iframe|object|embed|form|noscript)[^>]*>[\s\S]*?<\/\1>/gi,
    "",
  );
  html = html.replace(/<(script|style|iframe|object|embed|form|noscript)[^>]*\/?>/gi, "");

  // Comments can hide conditional markup.
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  return html.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*)?)\/?>/g,
    (match, closing: string, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (closing) return `</${tag}>`;

      const allowed = ALLOWED_ATTRIBUTES[tag];
      if (!allowed) return `<${tag}>`;

      const kept: string[] = [];
      const attrPattern = /([a-zA-Z-]+)\s*=\s*"([^"]*)"|([a-zA-Z-]+)\s*=\s*'([^']*)'/g;

      let attr: RegExpExecArray | null;
      while ((attr = attrPattern.exec(rawAttrs)) !== null) {
        const name = (attr[1] || attr[3] || "").toLowerCase();
        const value = attr[2] ?? attr[4] ?? "";

        if (!allowed.has(name)) continue;
        if ((name === "href" || name === "src") && !safeUrl(value)) continue;

        kept.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
      }

      // A link that opens a new tab must not hand the opener to the target.
      if (tag === "a" && kept.some((a) => a.startsWith('target="_blank"'))) {
        if (!kept.some((a) => a.startsWith("rel="))) {
          kept.push('rel="noopener noreferrer"');
        }
      }

      return kept.length ? `<${tag} ${kept.join(" ")}>` : `<${tag}>`;
    },
  );
}
