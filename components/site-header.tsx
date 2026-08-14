"use client";

import Image from "next/image";
import Link from "@/components/safe-link";
import { Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";
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
          <button className="overlay-close" onClick={() => setSearchOpen(false)} aria-label="Đóng tìm kiếm"><X /></button>
          <form action="/hoa" className="search-dialog">
            <span className="eyebrow">Bạn đang tìm điều gì?</span>
            <label htmlFor="site-search">Tìm bó hoa cho khoảnh khắc của bạn</label>
            <div><Search /><input id="site-search" name="q" placeholder="Thử “sinh nhật”, “cẩm tú cầu”..." /><button type="submit">Tìm kiếm</button></div>
          </form>
        </div>
      )}
    </>
  );
}
