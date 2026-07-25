import { pageByPath } from "@/lib/registry";
import { pageMetadata } from "@/lib/meta";
import { breadcrumbNode, graph } from "@/lib/jsonld";
import { JsonLd } from "@/components/site/JsonLd";
import { DownloadInterstitial } from "./DownloadInterstitial";

// The public download page, the landing spot for every "Get Cereal Milk" on the
// site (download-first funnel, 2026-07-14; superset.sh interstitial layout
// + Windows support, 2026-07-23). The page itself is a thin server shell
// (metadata + JSON-LD); the client interstitial detects the visitor's
// platform and auto-starts the right installer: /download/CerealMilk.dmg on Mac,
// /download/CerealMilk.exe on Windows, a manual picker anywhere else. Both file
// routes first-party-log the hit, then 307 to the current release on
// cerealmilk-sh/product-releases, so this page never goes stale. The app is free
// (no trial, no card): sign in with Google or email, scan the WhatsApp QR,
// connect the model account you already pay for.

const entry = pageByPath("/download")!;
export const metadata = pageMetadata(entry);

export default function DownloadPage() {
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumbNode("/download", [
            { name: "Download Cereal Milk", path: "/download" },
          ])
        )}
      />
      <DownloadInterstitial />
    </>
  );
}
