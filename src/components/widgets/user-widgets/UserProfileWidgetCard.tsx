"use client";

import { Save } from "lucide-react";
import { useState } from "react";

import { UserAvatarBadge, avatarStyleOptions } from "@/components/user/avatar-styles";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";
import type { WidgetInstanceRecord } from "@/lib/widgets";

export interface UserProfileViewModel {
  email: string;
  displayName: string | null;
  avatarStyle: string | null;
  emailVerifiedAt: string | null;
}

interface UserProfileWidgetCardProps {
  widget: WidgetInstanceRecord;
  profile: UserProfileViewModel;
  saving: boolean;
  onSave: (input: { displayName: string; avatarStyle: string }) => Promise<void>;
}

export function UserProfileWidgetCard({
  widget,
  profile,
  saving,
  onSave,
}: UserProfileWidgetCardProps) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [avatarStyle, setAvatarStyle] = useState(profile.avatarStyle ?? avatarStyleOptions[0].id);

  return (
    <WidgetChrome
      eyebrow="Profile"
      title={widget.name}
      subtitle="Identity, avatar, and account presence."
      identityVisibility="settings-only"
    >
      <div className="rounded-[24px] bg-white/55 p-5">
        <div className="flex items-center gap-4">
          <UserAvatarBadge styleId={avatarStyle} size="lg" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
              Account
            </p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-neutral-950">
              {displayName || "Curator"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">{profile.email}</p>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Display Name
          </label>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none"
            placeholder="Curator Name"
          />
        </div>

        <div className="mt-5">
          <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Avatar Style
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {avatarStyleOptions.map((option) => {
              const active = option.id === avatarStyle;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAvatarStyle(option.id)}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${
                    active
                      ? "border-[#00327d] bg-[#00327d]/6"
                      : "border-black/10 bg-white/60 hover:bg-white"
                  }`}
                >
                  <UserAvatarBadge styleId={option.id} size="sm" />
                  <span className="text-sm font-semibold text-neutral-900">{option.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-black/8 bg-white/60 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
              Email Verification
            </p>
            <p className="mt-1 text-sm text-neutral-700">
              {profile.emailVerifiedAt ? "Verified" : "Pending verification"}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
              profile.emailVerifiedAt
                ? "bg-[#00327d] text-white"
                : "bg-[#ffdf00] text-[#111111]"
            }`}
          >
            {profile.emailVerifiedAt ? "Active" : "Pending"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSave({ displayName, avatarStyle })}
          disabled={saving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00327d] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#001f4d] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </WidgetChrome>
  );
}
