// Resolves the current desktop-app installer URLs from the release channel's
// own electron-updater manifests, so the evergreen download routes never
// hard-code a version and never depend on GitHub's "latest release" ordering
// (two release lines publish to 80x-org/product-releases: the legacy Mac
// v1.4-b* line and the desktop-v* line that ships both the Mac dmg and the
// Windows exe; whichever publishes most recently is "latest").
//
// The desktop release CI commits two manifests to the repo tree on every
// ship: desktop/latest-mac.yml (the updater's zip entry plus the browser
// dmg) and desktop/latest.yml (the Windows exe). Each carries the full
// download URL of its artifacts, so resolving is: fetch the manifest, pick
// the line whose URL ends in the extension we want. Cached for 5 minutes;
// a fresh release can take that long to reach the site, which is fine.

const MANIFEST_BASE =
  "https://raw.githubusercontent.com/80x-org/product-releases/main/desktop";

export async function resolveDesktopAsset(
  channel: "mac" | "windows"
): Promise<string | null> {
  const manifest = channel === "mac" ? "latest-mac.yml" : "latest.yml";
  const ext = channel === "mac" ? ".dmg" : ".exe";
  try {
    const res = await fetch(`${MANIFEST_BASE}/${manifest}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*(?:url|path):\s*(\S+)\s*$/);
      if (m && m[1].endsWith(ext)) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}
