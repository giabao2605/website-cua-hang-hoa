import assert from "node:assert/strict";
import test from "node:test";
import { getJournalArticle, journalArticles } from "../../lib/journal.ts";

test("seasonal journal exposes three complete, uniquely addressable articles", () => {
  assert.equal(journalArticles.length, 3);
  assert.equal(new Set(journalArticles.map((article) => article.slug)).size, 3);
  for (const article of journalArticles) {
    assert.match(article.slug, /^[a-z0-9-]+$/);
    assert.ok(article.excerpt.length >= 80);
    assert.ok(article.sections.length >= 3);
    assert.ok(article.sections.every((section) => section.paragraphs.length >= 1));
    assert.equal(getJournalArticle(article.slug), article);
  }
  assert.equal(getJournalArticle("khong-ton-tai"), undefined);
});
