import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/safe-link";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { JournalCard } from "../../../components/journal-card";
import { getJournalArticle, journalArticles } from "../../../lib/journal";

export function generateStaticParams() {
  return journalArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getJournalArticle((await params).slug);
  return article ? { title: article.title, description: article.excerpt, openGraph: { images: [article.image] } } : {};
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getJournalArticle((await params).slug);
  if (!article) notFound();
  const relatedArticles = journalArticles.filter((candidate) => candidate.slug !== article.slug);
  return (
    <>
      <article className="journal-article">
        <header className="journal-article-header"><div className="container journal-article-heading"><Link className="journal-back" href="/nhat-ky"><ArrowLeft size={17} /> Nhật ký mùa hoa</Link><span className="eyebrow">{article.category}</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className="journal-meta"><span><CalendarDays />{new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(`${article.publishedAt}T12:00:00+07:00`))}</span><span><Clock3 />{article.readTime}</span></div></div></header>
        <div className="container journal-cover"><Image src={article.image} alt={article.imageAlt} width={1122} height={1402} priority /></div>
        <div className="journal-prose">{article.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.tip && <aside><strong>Ghi nhớ</strong><p>{section.tip}</p></aside>}</section>)}</div>
        <footer className="container journal-article-footer"><Link href="/nhat-ky">Xem tất cả bài viết <ArrowRight size={17} /></Link></footer>
      </article>
      <section className="section related-section"><div className="container"><div className="section-heading split-heading"><div><span className="eyebrow">Đọc tiếp</span><h2>Có thể bạn cũng quan tâm</h2></div><Link className="text-link" href="/nhat-ky">Xem tất cả bài viết <ArrowRight size={16} /></Link></div><div className="journal-grid journal-related-grid">{relatedArticles.map((relatedArticle) => <JournalCard key={relatedArticle.slug} article={relatedArticle} />)}</div></div></section>
    </>
  );
}
