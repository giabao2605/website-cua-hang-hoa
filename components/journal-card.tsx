import Image from "next/image";
import Link from "@/components/safe-link";
import { ArrowRight } from "lucide-react";
import type { JournalArticle } from "../lib/journal";

export function JournalCard({ article }: { article: JournalArticle }) {
  return (
    <article>
      <Link className="journal-image-link" href={`/nhat-ky/${article.slug}`}><Image src={article.image} alt={article.imageAlt} width={1122} height={1402} /></Link>
      <span>{article.category}</span>
      <h3><Link href={`/nhat-ky/${article.slug}`}>{article.title}</Link></h3>
      <p>{article.excerpt}</p>
      <Link href={`/nhat-ky/${article.slug}`}>Đọc bài viết <ArrowRight size={15} /></Link>
    </article>
  );
}
