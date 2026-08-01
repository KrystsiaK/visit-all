"use client";

const COMMANDS = [
  { name: "/poll", desc: 'Create interactive poll: /poll "Question" "Option A" "Option B"' },
  { name: "/todo", desc: 'Create checklist: /todo "Task text"' },
  { name: "/status", desc: 'Set status: /status "Lunch"' },
  { name: "/clear", desc: "Clear current chat history" },
  { name: "/help", desc: "Show commands help" },
  { name: "/theme-sand", desc: "Switch to Classic Sand theme" },
  { name: "/theme-midnight", desc: "Switch to Midnight Velvet theme" },
  { name: "/theme-sakura", desc: "Switch to Sakura Breeze theme" },
  { name: "/theme-cyberpunk", desc: "Switch to Cyberpunk Neon theme" },
  { name: "/theme-emerald", desc: "Switch to Emerald Forest theme" },
  { name: "/theme-cinematic", desc: "Switch to Cinematic Glass theme" },
];

interface SlashCommandPaletteProps {
  filter: string;
  onSelect: (cmd: string) => void;
}

export function SlashCommandPalette({ filter, onSelect }: SlashCommandPaletteProps) {
  const matches = COMMANDS.filter((c) => c.name.startsWith(filter));

  return (
    <div className="absolute bottom-20 left-4 z-40 w-80 max-h-48 overflow-y-auto rounded-2xl border border-black/8 shadow-lg bg-white/95 backdrop-blur-md p-1.5 flex flex-col gap-0.5 custom-scrollbar">
      <div className="px-2.5 py-1.5 text-[9px] font-black uppercase text-neutral-400 tracking-wider border-b border-black/5 mb-1 shrink-0">
        Slash Commands
      </div>
      {matches.length === 0 ? (
        <span className="text-[10px] text-neutral-400 italic px-2.5 py-2 font-bold text-center">
          Command not found
        </span>
      ) : (
        matches.map((cmd) => (
          <button
            key={cmd.name}
            type="button"
            onClick={() => onSelect(cmd.name + " ")}
            className="flex flex-col text-left px-2.5 py-1.5 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
          >
            <span className="text-xs font-black text-neutral-900">{cmd.name}</span>
            <span className="text-[10px] text-neutral-500 font-medium leading-normal mt-0.5">
              {cmd.desc}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

export { COMMANDS };