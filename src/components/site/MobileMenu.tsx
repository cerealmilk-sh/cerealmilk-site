"use client";

// The mobile nav island: a hamburger that opens a full-screen panel with the
// same groups as the desktop mega-menus (group label + large links) and the
// Contact / Book-a-call pill pair. Group data arrives serialized from the
// server Header, so this stays a thin client shell.

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoLockup } from "./Logo";

export type MobileMenuLink = { label: string; href: string; external?: boolean };
export type MobileMenuGroup = { label: string; links: MobileMenuLink[] };

export function MobileMenu({
  groups,
  contactHref,
  bookHref,
}: {
  groups: MobileMenuGroup[];
  contactHref: string;
  bookHref: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-edge-2 text-ink-dim transition-colors hover:bg-panel-2 hover:text-ink"
      >
        <Menu size={16} strokeWidth={2} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[70] flex flex-col bg-bg"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-edge px-6">
            <Link
              href="/"
              onClick={close}
              className="flex select-none items-center rounded-[9px] transition-opacity hover:opacity-80"
              aria-label="Cereal Milk · home"
            >
              <LogoLockup size={30} />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-edge-2 text-ink-dim transition-colors hover:bg-panel-2 hover:text-ink"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <nav aria-label="Site" className="flex-1 overflow-y-auto px-6 pb-10">
            {groups.map((group) => (
              <div key={group.label} className="mt-8">
                <p className="mb-2 text-[14px] text-ink-faint">{group.label}</p>
                {group.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      rel="noopener"
                      onClick={close}
                      className="block py-2.5 text-[24px] font-medium leading-[1.15] text-ink transition-colors hover:text-ink-dim"
                    >
                      {link.label}{" "}
                      <span aria-hidden className="text-[14px] text-ink-faint">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="block py-2.5 text-[24px] font-medium leading-[1.15] text-ink transition-colors hover:text-ink-dim"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3 border-t border-edge px-6 py-4">
            <Link
              href={contactHref}
              onClick={close}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-edge-2 text-sm font-medium text-ink transition-colors hover:bg-panel-2"
            >
              Contact
            </Link>
            <Link
              href={bookHref}
              onClick={close}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-ink transition-colors hover:bg-accent-dim"
            >
              Book a demo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
