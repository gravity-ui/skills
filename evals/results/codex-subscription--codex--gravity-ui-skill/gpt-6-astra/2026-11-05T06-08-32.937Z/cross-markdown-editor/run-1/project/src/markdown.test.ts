import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("Markdown preview", () => {
  it("renders the formatting supported by the editor", () => {
    const html = renderMarkdown(
      "## План\n\n**Важно** и *интересно*\n\n- Первый пункт\n\n> Цитата\n\n`код`\n\n[ссылка](https://example.com)",
    );
    for (const fragment of [
      "<h2>План</h2>",
      "<strong>Важно</strong>",
      "<em>интересно</em>",
      "<li>Первый пункт</li>",
      "<blockquote>",
      "<code>код</code>",
      'href="https://example.com"',
    ]) {
      expect(html).toContain(fragment);
    }
  });
  it("escapes raw HTML and rejects script URLs", () => {
    const html = renderMarkdown(
      "<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[опасная ссылка](javascript:alert(1))",
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain("&lt;script&gt;");
  });
  it("renders an empty document without placeholder HTML", () => {
    expect(renderMarkdown("")).toBe("");
  });
});
