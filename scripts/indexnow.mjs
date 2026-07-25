// Pings IndexNow (Bing, Yandex, Seznam, Naver…) with every URL in the live
// sitemap. Run after each production deploy:
//
//   npm run indexnow
//
// The key file lives at public/23f5d7103249b53cf9291b33294744db.txt, if you
// rotate the key, change BOTH that filename/content and KEY below.

const SITE = "https://cerealmilk.sh";
const KEY = "23f5d7103249b53cf9291b33294744db";

const res = await fetch(`${SITE}/sitemap.xml`);
if (!res.ok) {
  console.error(`Failed to fetch sitemap: ${res.status}`);
  process.exit(1);
}
const xml = await res.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error("No URLs found in sitemap.");
  process.exit(1);
}

const ping = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: "cerealmilk.sh",
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls,
  }),
});

console.log(`IndexNow: submitted ${urls.length} URLs → ${ping.status} ${ping.statusText}`);
if (!ping.ok && ping.status !== 202) {
  console.error(await ping.text().catch(() => ""));
  process.exit(1);
}
