// src/modules/messenger/components/BotAppHome.tsx
"use client";

import { useState, useEffect } from "react";
import { UserAvatarBadge } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { CheckSquare, Square, Plus, Trash2, Calendar, Coffee, Home, Compass } from "lucide-react";
import { type MessengerTheme, MESSENGER_THEMES } from "../types";

interface BotAppHomeProps {
  userProfile: { displayName: string | null; avatarStyle: string | null; email: string };
  chatCount: number;
  activeTheme: MessengerTheme;
  onSelectTheme: (theme: MessengerTheme) => void;
  onSetStatus: (status: string | null) => void;
}

interface LocalTask {
  id: string;
  text: string;
  completed: boolean;
}

const STATUS_PRESETS = [
  { emoji: "🍔", text: "Eating Lunch", icon: Coffee },
  { emoji: "📅", text: "In a Meeting", icon: Calendar },
  { emoji: "🏠", text: "Working Remotely", icon: Home },
  { emoji: "🌴", text: "On Vacation", icon: Compass },
];

export function BotAppHome({
  userProfile,
  chatCount,
  activeTheme,
  onSelectTheme,
  onSetStatus
}: BotAppHomeProps) {
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  // Load tasks from localStorage on client side
  useEffect(() => {
    const saved = localStorage.getItem("bot_app_home_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        // Fallback
      }
    } else {
      // Default tasks
      setTasks([
        { id: "1", text: "Study Slack API documentation", completed: true },
        { id: "2", text: "Test interactive polls (/poll)", completed: false },
        { id: "3", text: "Message Antigravity assistant", completed: false }
      ]);
    }
  }, []);

  const saveTasks = (updated: LocalTask[]) => {
    setTasks(updated);
    localStorage.setItem("bot_app_home_tasks", JSON.stringify(updated));
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const task: LocalTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false
    };
    const updated = [...tasks, task];
    saveTasks(updated);
    setNewTaskText("");
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar z-10 relative bg-black/[0.02] min-h-0">
      {/* Welcome Hero banner */}
      <LiquidGlassSurface
        variant="frosted-glass"
        tone={activeTheme.glassTone}
        effect="amplified"
        className="p-5 rounded-[28px] border border-black/8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40"
      >
        <div className="flex items-center gap-4">
          <UserAvatarBadge styleId={userProfile.avatarStyle || "mondrian-primary"} size="lg" />
          <div>
            <h2 className="text-lg font-black text-neutral-900 leading-tight">
              Welcome back, {userProfile.displayName || "User"}! 👋
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-1">
              This is your integration dashboard. Manage your status and tasks directly here.
            </p>
          </div>
        </div>
        <div className="flex gap-3 text-center shrink-0">
          <div className="bg-black/4 border border-black/5 rounded-2xl px-4 py-2">
            <span className="block text-xl font-black text-neutral-800 leading-none">{chatCount}</span>
            <span className="text-[9px] font-black uppercase text-neutral-450 tracking-wider">Chat Sessions</span>
          </div>
          <div className="bg-black/4 border border-black/5 rounded-2xl px-4 py-2">
            <span className="block text-xs font-black text-neutral-800 leading-none py-1 capitalize">{activeTheme.id}</span>
            <span className="text-[9px] font-black uppercase text-neutral-450 tracking-wider">Theme</span>
          </div>
        </div>
      </LiquidGlassSurface>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Presets Block */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">Set Quick Status</h3>
          <div className="bg-white/60 dark:bg-black/20 rounded-[24px] border border-black/5 p-4 space-y-3 shadow-xs">
            <div className="grid grid-cols-2 gap-2">
              {STATUS_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                return (
                  <button
                    key={preset.text}
                    onClick={() => onSetStatus(`${preset.emoji} ${preset.text}`)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-black/8 bg-white hover:bg-black/4 hover:scale-[1.02] active:scale-98 transition-all text-left text-xs font-bold text-neutral-800 shadow-xs cursor-pointer"
                  >
                    <IconComponent className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="truncate">{preset.emoji} {preset.text}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onSetStatus(null)}
              className="w-full text-center text-xs font-black text-neutral-500 hover:text-neutral-800 hover:bg-black/4 py-2 rounded-xl border border-dashed border-black/10 transition-colors cursor-pointer"
            >
              Clear current status
            </button>
          </div>
        </div>

        {/* Quick Task List Block */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">My Checklist</h3>
          <div className="bg-white/60 dark:bg-black/20 rounded-[24px] border border-black/5 p-4 flex flex-col gap-3 shadow-xs min-h-[180px]">
            {/* Add task bar */}
            <div className="flex gap-2 shrink-0">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="New task..."
                className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl border border-black/8 bg-white outline-none focus:border-black/15 placeholder-neutral-400"
              />
              <button
                onClick={handleAddTask}
                className="p-2 text-white rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                style={{ backgroundColor: activeTheme.accentColor }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[160px] custom-scrollbar">
              {tasks.length === 0 ? (
                <p className="text-[11px] text-neutral-400 text-center py-6 font-bold italic">No tasks scheduled</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-2 p-1.5 hover:bg-black/4 rounded-lg group transition-colors">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="flex items-center gap-2 text-left text-xs font-bold text-neutral-850 min-w-0"
                    >
                      <div className="shrink-0" style={{ color: task.completed ? activeTheme.accentColor : "#737373" }}>
                        {task.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </div>
                      <span className={`truncate leading-none ${task.completed ? "line-through text-neutral-400 font-medium" : ""}`}>
                        {task.text}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Themes Customizer */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">Quick Theme Customizer</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MESSENGER_THEMES.map((theme) => {
            const isSelected = activeTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`p-3 rounded-2xl text-left border relative overflow-hidden transition-all hover:scale-[1.03] active:scale-98 cursor-pointer ${
                  isSelected ? "border-2 shadow-md scale-[1.01]" : "border-black/8 hover:border-black/15 shadow-xs"
                }`}
                style={{ 
                  background: theme.wallpaper,
                  borderColor: isSelected ? theme.accentColor : undefined
                }}
              >
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: theme.pattern === "radial-dot"
                      ? `radial-gradient(circle, #000 1px, transparent 1px)`
                      : theme.pattern === "grid"
                      ? `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`
                      : `none`,
                    backgroundSize: "16px 16px"
                  }}
                />
                
                {/* Accent Color Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-black text-neutral-900 bg-white/95 px-1.5 py-0.5 rounded-full shadow-xs">
                    {theme.name.split(" ").slice(-1)[0] || ""}
                  </span>
                  <div 
                    className="w-3 h-3 rounded-full border border-white/50 shadow-xs" 
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
                
                <span className="block text-xs font-extrabold text-neutral-950 mt-4 relative z-10 bg-white/70 px-1 rounded-sm w-fit leading-none py-0.5">
                  {theme.name.split(" ").slice(0, -1).join(" ")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
