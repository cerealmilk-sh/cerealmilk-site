// Floating "chat with the founder" button, rendered on every page via the root
// layout (wrapped in a .studio context so the palette resolves consistently). A
// plain link to wa.me (no JS), so it works server-rendered; the consent-gated
// analytics loader auto-captures the click via [data-track]. Hidden
// automatically when CONTACT_WHATSAPP is unset. Shows Daniel's headshot with a
// small WhatsApp badge so it reads as "talk to this person"; avatar-only on
// mobile, avatar + label from `sm` up.

import Image from "next/image";
import { AUTHOR, CONTACT_WHATSAPP_URL } from "@/lib/site";

export function WhatsAppButton() {
  if (!CONTACT_WHATSAPP_URL) return null;
  return (
    <a
      href={CONTACT_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-track="whatsapp_message_clicked"
      aria-label="Chat with Daniel, founder of Cereal Milk, on WhatsApp"
      title="Chat with the founder on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full border border-edge bg-panel/90 p-1.5 text-[13.5px] font-medium text-ink shadow-lg backdrop-blur transition-colors hover:border-ink sm:bottom-6 sm:right-6 sm:pr-4"
    >
      <span className="relative inline-block shrink-0">
        <Image
          src={AUTHOR.photo}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover"
        />
        {/* WhatsApp glyph badge, ringed by the pill background */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-panel">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-[#25D366]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </span>
      </span>
      <span className="hidden pr-0.5 sm:inline">Chat with the founder</span>
    </a>
  );
}
