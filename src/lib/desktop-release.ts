// Resolves the current desktop-app installer URLs from the public
// cerealmilk-sh/product-releases repo's electron-updater manifests, so the
// evergreen download routes never hard-code a version and never depend on
// GitHub's "latest release" API for resolution (which would also be limited
// to 60/hr per IP for unauthenticated calls).
//
// The desktop release CI commits two manifests to the repo tree on every
// ship: desktop/latest-mac.yml (the updater's zip entry plus the browser
// dmg) and desktop/latest.yml (the Windows exe). Each carries the full
// download URL of its artifacts (pointing at GitHub Releases on this same
// repo, public and unmetered), so resolving is: fetch the manifest, pick
// the line whose URL ends in the extension we want. Cached for 5 minutes.

const MANIFEST_BASE =
  "https://raw.githubusercontent.com/cerealmilk-sh/product-releases/main/desktop";

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
      // `- url:` list entries included: the dmg only ever appears as a
      // files[] entry in latest-mac.yml (the top-level path: is the zip),
      // so without the optional `-` this loop never found a .dmg and every
      // mac download silently took the releases/latest fallback.
      const m = line.match(/^\s*(?:-\s*)?(?:url|path):\s*(\S+)\s*$/);
      if (m && m[1].endsWith(ext)) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}