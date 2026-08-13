export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new Response([
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api/",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    "",
  ].join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
