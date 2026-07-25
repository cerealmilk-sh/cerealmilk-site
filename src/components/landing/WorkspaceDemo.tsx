// The hero product frame, reference anatomy: a 16/10 windowed mock under a
// soft white glow, three panes (sidebar · conversation · inspector), and a
// row of feature chips beneath. All static markup; the content is the real
// 80x anatomy: channel groups on the left, the open chat in the middle, the
// CRM record docked on the right. Numbers and labels mirror what the product
// actually shows; nothing here fakes a capability.

const CHANNELS: {
  group: string;
  count: number;
  rows: {
    name: string;
    meta?: string;
    active?: boolean;
    syncing?: boolean;
    filed?: number;
    pending?: number;
  }[];
}[] = [
  {
    group: "whatsapp",
    count: 5,
    rows: [
      { name: "Riva · Series A", active: true, syncing: true, filed: 46 },
      { name: "Meridian · LP group", filed: 193 },
      { name: "Padel Sunday", meta: "private" },
      { name: "Atlas follow-up", filed: 33, pending: 1 },
    ],
  },
  { group: "linkedin", count: 3, rows: [] },
  { group: "gmail", count: 2, rows: [] },
];

const CHAT_TABS = ["Riva", "Meridian", "Atlas", "Warm intro"];

const RECORD_FIELDS = [
  { label: "Stage", value: "Diligence" },
  { label: "Owner", value: "You" },
  { label: "Next step", value: "Partner call, Thu" },
  { label: "Source", value: "WhatsApp thread" },
];

const ACTIVITY = [
  { file: "Deck v3 received", n: "+1" },
  { file: "Terms summary filed", n: "+12" },
  { file: "Intro to Meridian", n: "+3" },
];

function TrafficLights({ size = "size-2.5" }: { size?: string }) {
  return (
    <>
      <div className={`${size} rounded-full bg-[#ff5f57]`} />
      <div className={`${size} rounded-full bg-[#febc2e]`} />
      <div className={`${size} rounded-full bg-[#28c840]`} />
    </>
  );
}

export function WorkspaceDemo() {
  return (
    <div className="relative mt-12 w-full sm:mt-16 lg:mt-20">
      <div className="relative mx-auto w-full">
        <div className="relative">
          {/* the soft glow behind the window */}
          <div className="pointer-events-none absolute inset-[10%] top-[20%] rounded-3xl bg-white/[0.07] blur-[60px]" />
          <div className="scrollbar-hide relative overflow-x-auto">
            <div
              className="relative w-full min-w-[700px] overflow-hidden rounded-md border border-border bg-background shadow-[0_30px_80px_-24px_rgba(0,0,0,0.7)]"
              style={{ aspectRatio: "16/10" }}
            >
              <div className="pointer-events-none absolute inset-0 z-20 rounded-md ring-1 ring-inset ring-white/[0.04]" />
              <div className="flex h-full">
                {/* ---- left: the channel sidebar -------------------------- */}
                <div className="flex w-[208px] shrink-0 flex-col border-r border-border bg-card text-[11px]">
                  <div className="flex h-9 items-center gap-1.5 px-3">
                    <TrafficLights />
                  </div>
                  <div className="space-y-px px-1.5 pt-1">
                    <div className="flex h-6 items-center gap-2 bg-foreground/[0.06] px-2 text-foreground">
                      <span className="font-mono text-[10px] text-muted-foreground/55">⌘K</span>
                      <span>Command palette</span>
                    </div>
                    <div className="flex h-6 items-center gap-2 px-2 text-foreground/85">
                      <span className="font-mono text-[10px] text-muted-foreground/55">⌘⇧S</span>
                      <span>Sync this chat</span>
                    </div>
                    <div className="flex h-6 items-center gap-2 px-2 text-muted-foreground/55">
                      <span className="font-mono text-[10px]">⌘L</span>
                      <span>Privacy blur</span>
                    </div>
                  </div>
                  <div className="mt-3 flex-1 overflow-hidden">
                    {CHANNELS.map((g, gi) => (
                      <div key={g.group} className={gi > 0 ? "mt-1" : undefined}>
                        <div className="flex h-6 items-center gap-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/65">
                          <span className="truncate">{g.group}</span>
                          <span className="ml-auto font-mono tabular-nums text-muted-foreground/40">
                            {g.count}
                          </span>
                        </div>
                        {g.rows.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {g.rows.map((r) => (
                              <div
                                key={r.name}
                                className={`relative flex h-7 items-center gap-2.5 pl-4 pr-3 text-[11px] ${
                                  r.active
                                    ? "bg-foreground/[0.06] text-foreground"
                                    : "text-foreground/80"
                                }`}
                              >
                                {r.active && (
                                  <span className="absolute inset-y-0.5 left-0 w-[2px] bg-brand" />
                                )}
                                <div className="flex size-3 shrink-0 items-center justify-center">
                                  {r.syncing ? (
                                    <span className="select-none font-mono text-[10px] text-brand-light">
                                      ⠋
                                    </span>
                                  ) : r.meta === "private" ? (
                                    <span className="relative inline-flex size-1.5 rounded-full bg-amber-300/90" />
                                  ) : (
                                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400/85" />
                                  )}
                                </div>
                                <span
                                  className={`min-w-0 flex-1 truncate ${r.active ? "font-medium" : ""}`}
                                >
                                  {r.name}
                                </span>
                                <span className="shrink-0 font-mono text-[10px] tabular-nums">
                                  {r.filed !== undefined && (
                                    <span className="text-emerald-400/80">+{r.filed}</span>
                                  )}
                                  {r.pending !== undefined && (
                                    <span className="ml-1 text-amber-300/75">•{r.pending}</span>
                                  )}
                                  {r.meta === "private" && (
                                    <span className="text-muted-foreground/55">private</span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pb-1.5">
                    <div className="flex h-7 items-center gap-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/65">
                      <span className="font-mono normal-case text-muted-foreground/55">⌥</span>
                      <span>Snippets</span>
                      <span className="ml-auto font-mono tabular-nums text-muted-foreground/40">4</span>
                    </div>
                    <div className="px-3 py-1">
                      <div className="truncate text-[10px] text-muted-foreground/65">intro</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="border border-border bg-background px-1.5 py-px font-mono text-[10px] text-muted-foreground/70">
                          ;intro
                        </span>
                        <span className="border border-border bg-background px-1.5 py-px font-mono text-[10px] text-muted-foreground/70">
                          ;follow
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---- center: the open conversation ---------------------- */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex h-8 items-center gap-0.5 border-b border-border bg-card/40 px-2">
                    {CHAT_TABS.map((t, i) => (
                      <div
                        key={t}
                        className={`relative flex h-full items-center gap-1.5 px-3 text-[11px] ${
                          i === 0
                            ? "font-medium text-foreground/95"
                            : "text-muted-foreground/65"
                        }`}
                      >
                        <span>{t}</span>
                        {i === 0 && (
                          <span className="absolute inset-x-2 -bottom-px h-[2px] bg-brand" />
                        )}
                      </div>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5">
                      <button className="flex h-6 items-center gap-1 border border-border bg-background px-2 text-[10px] font-medium uppercase tracking-[0.06em] text-foreground/85">
                        <span>Export</span>
                      </button>
                      <button className="flex h-6 items-center gap-1 border border-emerald-500/40 bg-emerald-500/15 px-2 text-[10px] font-medium uppercase tracking-[0.06em] text-emerald-300">
                        <span>Sync</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col bg-background">
                    <div className="relative flex-1 overflow-hidden p-5 font-mono text-[11px] leading-relaxed">
                      <div className="flex h-full flex-col">
                        <div>
                          <div className="mb-5 flex items-start gap-4">
                            <div className="whitespace-pre text-[11px] leading-none text-brand-light">
                              {"▛ 80x ▜\n▙ ─── ▟"}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              <div>
                                <span className="font-medium text-foreground">Riva · Series A</span>{" "}
                                WhatsApp
                              </div>
                              <div>Founder thread · 2 participants</div>
                              <div className="text-muted-foreground/65">
                                record: attio/riva-series-a
                              </div>
                            </div>
                          </div>
                          <div className="mb-5 text-foreground">
                            <span className="text-muted-foreground/55">❯</span>{" "}
                            <span className="text-brand-light">⌘⇧S sync this chat</span>
                          </div>
                          <div className="space-y-2.5 border-t border-border pt-4">
                            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/65">
                              Privacy gate
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              1 thread shared · everything else private
                            </div>
                            <div>
                              <span className="text-muted-foreground/55">❯</span>
                              <span className="ml-1 text-foreground">1.</span>
                              <span className="ml-1 text-brand-light">riva-series-a</span>
                              <span className="ml-2 text-emerald-400/85">✓ filed to Attio</span>
                            </div>
                            <div className="text-muted-foreground/65">
                              gate: <span className="text-muted-foreground/50">enforced on the server</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-auto border-t border-border pt-4">
                          <div className="flex items-center gap-3 border border-border bg-card/60 px-3 py-2.5">
                            <span className="text-muted-foreground/55">❯</span>
                            <span className="flex-1 text-[11px] text-muted-foreground/55">
                              Type a reply, you always hit send…
                            </span>
                            <div className="flex size-5 items-center justify-center rounded-sm bg-brand/15 text-[11px] text-brand-light">
                              ↵
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---- right: the CRM inspector --------------------------- */}
                <div
                  className="relative flex shrink-0 flex-col overflow-hidden border-l border-border bg-card text-[11px]"
                  style={{ width: 236 }}
                >
                  <div className="flex h-9 items-center justify-end border-b border-border px-3">
                    <button className="flex h-6 items-center gap-1 border border-border bg-background px-2 text-[10px] font-medium uppercase tracking-[0.06em] text-foreground/85">
                      <span>Attio</span>
                      <span className="font-mono tabular-nums text-muted-foreground/55">↗</span>
                    </button>
                  </div>
                  <div className="flex h-8 items-center gap-3 border-b border-border px-3">
                    <div className="relative flex h-8 items-center text-[11px] font-medium text-foreground/95">
                      Record
                      <span className="absolute inset-x-0 -bottom-px h-[2px] bg-brand" />
                    </div>
                    <div className="flex h-8 items-center text-[11px] font-medium text-muted-foreground/55">
                      Activity
                    </div>
                    <div className="flex h-8 items-center text-[11px] font-medium text-muted-foreground/55">
                      Insights
                    </div>
                  </div>
                  <div className="border-b border-border px-3 py-2.5">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="size-1.5 rounded-full bg-brand" />
                      <span className="truncate font-medium text-foreground/95">
                        riva-series-a
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/60">
                      <span className="tabular-nums text-emerald-400/85">+46 filed</span>
                      <span className="text-muted-foreground/45">·</span>
                      <span>1 withheld</span>
                      <span className="text-muted-foreground/45">·</span>
                      <span>shared</span>
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <div className="flex-1 space-y-0.5 overflow-hidden py-1.5">
                      <div className="flex items-center gap-1.5 px-3 pb-2 pt-3 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground/65">
                        <span className="truncate">fields</span>
                      </div>
                      {RECORD_FIELDS.map((f) => (
                        <div
                          key={f.label}
                          className="flex h-7 items-center justify-between gap-2 pl-[26px] pr-3"
                        >
                          <span className="truncate text-[11px] text-muted-foreground">
                            {f.label}
                          </span>
                          <span className="shrink-0 text-[11px] text-foreground/85">
                            {f.value}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5 px-3 pb-2 pt-5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground/65">
                        <span className="truncate">notes filed</span>
                      </div>
                      {ACTIVITY.map((a) => (
                        <div
                          key={a.file}
                          className="flex h-7 items-center justify-between gap-2 pl-[26px] pr-3"
                        >
                          <span className="truncate text-[11px] text-muted-foreground">
                            {a.file}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] tabular-nums text-emerald-400/85">
                            {a.n}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- the feature chips below the frame --------------------------- */}
      <div className="scrollbar-hide mt-4 flex items-center gap-2 overflow-x-auto px-4 sm:justify-center sm:px-0">
        {[
          "Every Channel, One Window",
          "File in One Keystroke",
          "Your CRM, Docked",
          "Private by Default",
        ].map((chip, i) => (
          <span
            key={chip}
            className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[2px] py-2 text-xs sm:text-sm ${
              i === 0
                ? "border border-foreground bg-foreground/90 px-[18px] text-background/80"
                : "border border-foreground/10 bg-foreground/[0.03] px-3 text-foreground/50 hover:border-foreground/20 hover:bg-foreground/[0.06] hover:text-foreground/70"
            }`}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
