"use client";

import Image from "next/image";
import Link from "@/components/safe-link";
import { Menu, Search, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "../lib/site";
import { CartLink } from "./cart-link";

const nav = [
  ["Trang chủ", "/"],
  ["Hoa theo mùa", "/hoa"],
  ["Dịp tặng", "/dip-tang"],
  ["Câu chuyện", "/gioi-thieu"],
  ["Giao hoa", "/chinh-sach-giao-hang"],
  ["Liên hệ", "/lien-he"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchShellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    searchInputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(searchShellRef.current?.querySelectorAll<HTMLElement>('a[href], input:not([disabled]), button:not([disabled])') ?? [])
        .filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus();
    };
  }, [searchOpen]);

  return (
    <>
      <div className="announcement">
        <span>Hoa tươi theo mùa, giao tận nơi trên toàn quốc</span>
        <Link href="/chinh-sach-giao-hang">Xem chính sách giao hoa</Link>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <button className="mobile-menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Mở menu">
            {open ? <X /> : <Menu />}
          </button>
          <Link className="brand" href="/" aria-label={`${site.name} - Trang chủ`}>
            <span className="brand-logo-frame"><Image src="/brand/tram-florist-logo.png" alt="Biểu tượng hoa hồng Trâm Florist" width={64} height={64} priority /></span>
            <span><strong>Trâm</strong><small>Florist</small></span>
          </Link>
          <nav className={open ? "main-nav main-nav-open" : "main-nav"} aria-label="Điều hướng chính">
            {nav.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            <button className="header-action search-button" type="button" onClick={() => setSearchOpen(true)} aria-label="Tìm hoa">
              <Search size={21} /><span>Tìm hoa</span>
            </button>
            <Link className="header-action" href="/tai-khoan"><UserRound size={21} /><span>Tài khoản</span></Link>
            <CartLink />
          </div>
        </div>
      </header>
      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Tìm kiếm hoa">
          <div ref={searchShellRef} className="search-shell">
            <aside className="search-aside">
              <span>Trâm Florist · Tuy An Bắc</span>
              <strong>Bắt đầu từ một người, một dịp hoặc một màu hoa.</strong>
              <p>Gõ điều bạn đang nghĩ đến. Kết quả sẽ đưa bạn thẳng đến những thiết kế phù hợp trong bộ sưu tập hiện có.</p>
              <nav aria-label="Gợi ý tìm nhanh"><Link href="/dip-tang?occasion=Sinh%20nh%E1%BA%ADt#goi-y" onClick={() => setSearchOpen(false)}>Hoa sinh nhật</Link><Link href="/dip-tang?occasion=K%E1%BB%B7%20ni%E1%BB%87m#goi-y" onClick={() => setSearchOpen(false)}>Hoa kỷ niệm</Link><Link href="/hoa" onClick={() => setSearchOpen(false)}>Tất cả thiết kế</Link></nav>
            </aside>
            <form action="/hoa" className="search-dialog">
              <span className="search-kicker">Tìm trong 12 thiết kế</span>
              <label htmlFor="site-search">Tìm bó hoa cho khoảnh khắc của bạn</label>
              <div className="search-field"><Search aria-hidden="true" /><input ref={searchInputRef} id="site-search" name="q" autoComplete="off" placeholder="Thử “sinh nhật”, “cẩm tú cầu”..." /><button type="submit">Tìm kiếm</button></div>
              <small>Nhấn Enter để xem kết quả</small>
            </form>
            <button className="overlay-close" type="button" onClick={() => setSearchOpen(false)} aria-label="Đóng tìm kiếm"><X /></button>
          </div>
        </div>
      )}
    </>
  );
}
