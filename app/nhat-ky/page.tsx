import type { Metadata } from "next";
import { JournalCard } from "../../components/journal-card";
import { journalArticles } from "../../lib/journal";

export const metadata: Metadata = {
  title: "Nhật ký mùa hoa",
  description: "Mẹo chăm hoa, cách chọn hoa và câu chuyện kết hoa theo mùa từ Trâm Florist.",
};

export default function JournalPage() {
  return (
    <>
      <section className="page-hero journal-hero"><div className="container"><span className="eyebrow eyebrow-light">Nhật ký mùa hoa</span><h1>Hiểu hoa hơn,<br />giữ cảm xúc lâu hơn.</h1><p>Mẹo chăm hoa dễ áp dụng, gợi ý chọn màu cho từng lời nhắn và những câu chuyện nhỏ phía sau mỗi thiết kế của Trâm.</p></div></section>
      <section className="section journal-index"><div className="container"><div className="journal-grid">{journalArticles.map((article) => <JournalCard key={article.slug} article={article} />)}</div></div></section>
    </>
  );
}
