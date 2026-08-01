"use client";

import { useState, useTransition } from "react";
import { UserAvatarBadge, PrimaryButton, OutlineButton } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { Search, Shield, Ban, CheckCircle, Loader } from "lucide-react";
import { updateUserRole, updateUserStatus } from "../actions";

interface UserRecord {
  id: string;
  email: string;
  display_name: string | null;
  avatar_style: string | null;
  status: string;
  role: string;
  created_at: Date;
  last_login_at: Date | null;
}

interface UsersTabProps {
  initialUsers: UserRecord[];
  currentUserRole: string;
}

export function UsersTab({ initialUsers, currentUserRole }: UsersTabProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtered users based on search term
  const filteredUsers = users.filter((u) => {
    const nameMatch = u.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  const handleRoleChange = async (targetUserId: string, nextRole: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await updateUserRole(targetUserId, nextRole);
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) => (u.id === targetUserId ? { ...u, role: nextRole } : u))
          );
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to update user role.");
      }
    });
  };

  const handleStatusToggle = async (targetUserId: string, currentStatus: string) => {
    setErrorMsg(null);
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    
    startTransition(async () => {
      try {
        const res = await updateUserStatus(targetUserId, nextStatus);
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) => (u.id === targetUserId ? { ...u, status: nextStatus } : u))
          );
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to toggle user status.");
      }
    });
  };

  // Check if role selection is disabled for a user
  const isRoleEditDisabled = (user: UserRecord) => {
    // Standard support can't edit roles at all
    if (currentUserRole === "support") return true;
    
    // Admins cannot edit superadmin or assign superadmin/admin roles
    if (currentUserRole === "admin") {
      if (user.role === "superadmin" || user.role === "admin") return true;
    }

    return false;
  };

  return (
    <LiquidGlassSurface
      variant="frosted-glass"
      tone="neutral"
      effect="default"
      className="p-5 rounded-[24px] border border-black/5 bg-white/60 shadow-xs flex flex-col gap-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase text-neutral-800 tracking-wide">
            Users & Permissions Management
          </h2>
          <p className="text-[11px] text-neutral-500 font-medium">
            Manage roles, permissions, and active status for accounts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs font-medium placeholder-neutral-450"
          />
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-[#b7102a]/10 border border-[#b7102a]/15 text-[#b7102a] text-xs font-semibold px-4 py-2.5 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Users List Table */}
      <div className="w-full overflow-x-auto border border-black/5 rounded-2xl bg-white/50">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-black/5 bg-black/[0.02] font-black uppercase text-neutral-500 tracking-wider">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 italic">
                  No users matched your search criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = false; // Add check if we wanted to prevent self edits
                
                return (
                  <tr key={u.id} className="hover:bg-white/30 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-neutral-800">
                      <div className="flex items-center gap-2">
                        <UserAvatarBadge styleId={u.avatar_style || "mondrian-primary"} size="sm" />
                        <span className="truncate max-w-[120px]">{u.display_name || "Guest Curator"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-neutral-600 font-mono select-all">
                      {u.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          u.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.status === "active" ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3" />
                            Suspended
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isRoleEditDisabled(u) ? (
                        <span className="font-bold text-neutral-800 capitalize">{u.role}</span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={isPending}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-white border border-black/10 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-neutral-400"
                        >
                          <option value="user">User</option>
                          <option value="support">Support</option>
                          <option value="admin">Admin</option>
                          {currentUserRole === "superadmin" && (
                            <option value="superadmin">Superadmin</option>
                          )}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-500 font-medium">
                      {new Date(u.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {currentUserRole !== "support" && (
                        <button
                          onClick={() => handleStatusToggle(u.id, u.status)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all ${
                            u.status === "active"
                              ? "border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100/50"
                              : "border-green-200 text-green-600 bg-green-50/50 hover:bg-green-100/50"
                          } cursor-pointer disabled:opacity-50`}
                        >
                          {isPending ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : u.status === "active" ? (
                            "Suspend"
                          ) : (
                            "Activate"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </LiquidGlassSurface>
  );
}
