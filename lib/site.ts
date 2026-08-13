import type { ShippingRule } from "./commerce.ts";

export const site = {
  name: "Trâm Florist",
  tagline: "Trao một mùa hoa, giữ một đời thương",
  phone: "0838469089",
  phoneDisplay: "0838 469 089",
  address: "Xã Tuy An Bắc, Tỉnh Đắk Lắk",
  openingHours: "08:00 - 17:00, Thứ Hai - Chủ Nhật",
  zaloUrl: "https://zalo.me/0838469089",
  momoNumber: "0838469089",
  momoOwner: "Chờ chủ shop xác nhận",
} as const;

export type SiteSettings = Readonly<{
  shopName: string;
  tagline: string;
  phone: string;
  phoneDisplay: string;
  address: string;
  openingHours: string;
  zaloUrl: string;
  momoNumber: string;
  momoOwner: string;
  momoQrImage: string;
  codEnabled: boolean;
  momoEnabled: boolean;
}>;

export const defaultSiteSettings: SiteSettings = {
  shopName: site.name,
  tagline: site.tagline,
  phone: site.phone,
  phoneDisplay: site.phoneDisplay,
  address: site.address,
  openingHours: site.openingHours,
  zaloUrl: site.zaloUrl,
  momoNumber: site.momoNumber,
  momoOwner: "NGUYỄN LÂM GIA BẢO",
  momoQrImage: "/payment/momo-nguyen-lam-gia-bao.png",
  codEnabled: true,
  momoEnabled: true,
};

export const shippingRules: readonly ShippingRule[] = [
  { id: "local", kind: "locality", value: "Xã Tuy An Bắc", fee: 25_000, priority: 300, active: true },
  { id: "daklak", kind: "province", value: "Đắk Lắk", fee: 50_000, priority: 200, active: true },
  { id: "region", kind: "region", value: "Tây Nguyên & Nam Trung Bộ", fee: 85_000, priority: 100, active: true },
  { id: "nationwide", kind: "nationwide", value: "Việt Nam", fee: 120_000, priority: 0, active: true },
];

export const provinceOptions = [
  { province: "Đắk Lắk", region: "Tây Nguyên & Nam Trung Bộ" },
  { province: "Gia Lai", region: "Tây Nguyên & Nam Trung Bộ" },
  { province: "Lâm Đồng", region: "Tây Nguyên & Nam Trung Bộ" },
  { province: "Khánh Hòa", region: "Tây Nguyên & Nam Trung Bộ" },
  { province: "Đà Nẵng", region: "Tây Nguyên & Nam Trung Bộ" },
  { province: "Hồ Chí Minh", region: "Miền Nam" },
  { province: "Hà Nội", region: "Miền Bắc" },
  { province: "Hải Phòng", region: "Miền Bắc" },
  { province: "Cần Thơ", region: "Miền Nam" },
] as const;
