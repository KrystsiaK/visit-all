"use client";

import { useState, useTransition } from "react";
import { ToggleSwitch, PrimaryButton } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { Shield, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { updateSystemIntegration } from "../actions";

interface IntegrationRecord {
  id: string;
  name: string;
  enabled: boolean;
  api_key: string | null;
  settings: any;
  updated_at: Date;
}

interface IntegrationsTabProps {
  initialIntegrations: IntegrationRecord[];
  currentUserRole: string;
}

export function IntegrationsTab({ initialIntegrations, currentUserRole }: IntegrationsTabProps) {
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>(initialIntegrations);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggle = (id: string, checked: boolean) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: checked } : item))
    );
  };

  const handleApiKeyChange = (id: string, val: string) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, api_key: val || null } : item))
    );
  };

  const handleSettingChange = (id: string, key: string, val: any) => {
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, settings: { ...item.settings, [key]: val } } : item))
    );
  };

  const handleSave = async (item: IntegrationRecord) => {
    if (currentUserRole !== "admin" && currentUserRole !== "superadmin") {
      setErrorId(item.id);
      setErrorMsg("Permission denied. Only Administrators can update service configurations.");
      return;
    }

    setSuccessId(null);
    setErrorId(null);
    setErrorMsg(null);

    startTransition(async () => {
      try {
        const res = await updateSystemIntegration(item.id, item.enabled, item.api_key, item.settings);
        if (res.ok) {
          setSuccessId(item.id);
          setTimeout(() => setSuccessId(null), 3000);
        }
      } catch (err: any) {
        setErrorId(item.id);
        setErrorMsg(err.message || "Failed to save settings.");
      }
    });
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeyId((prev) => (prev === id ? null : id));
  };

  const isConfigDisabled = currentUserRole !== "admin" && currentUserRole !== "superadmin";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {integrations.map((item) => {
        const isKeyVisible = visibleKeyId === item.id;
        const isSaving = isPending && errorId !== item.id && successId !== item.id;

        return (
          <LiquidGlassSurface
            key={item.id}
            variant="frosted-glass"
            tone="neutral"
            effect="default"
            className="p-5 rounded-[24px] border border-black/5 bg-white/60 shadow-xs flex flex-col justify-between gap-5"
          >
            <div className="space-y-4">
              
              {/* Card Header & Toggle */}
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div>
                  <h3 className="text-sm font-black text-neutral-800 uppercase tracking-tight">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span 
                      className={`inline-block w-2 h-2 rounded-full ${
                        item.enabled ? "bg-green-500 animate-pulse" : "bg-neutral-400"
                      }`} 
                    />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      {item.enabled ? "Enabled & Live" : "Disabled"}
                    </span>
                  </div>
                </div>

                <ToggleSwitch
                  checked={item.enabled}
                  disabled={isConfigDisabled || isPending}
                  onChange={(checked) => handleToggle(item.id, checked)}
                />
              </div>

              {/* Settings Fields */}
              <div className="space-y-3">
                
                {/* API Key / Secrets */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
                    API Secret Key / Token
                  </label>
                  <div className="relative">
                    <input
                      type={isKeyVisible ? "text" : "password"}
                      value={item.api_key || ""}
                      disabled={isConfigDisabled || isPending}
                      onChange={(e) => handleApiKeyChange(item.id, e.target.value)}
                      placeholder={isConfigDisabled ? "••••••••••••••••" : "Enter API key or credential secret..."}
                      className="w-full pl-3 pr-9 py-2 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(item.id)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                    >
                      {isKeyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Service Specific Settings */}
                {item.id === "google_analytics" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
                      Google Measurement ID
                    </label>
                    <input
                      type="text"
                      value={item.settings.measurement_id || ""}
                      disabled={isConfigDisabled || isPending}
                      onChange={(e) => handleSettingChange(item.id, "measurement_id", e.target.value)}
                      placeholder="e.g. G-XXXXXXXXXX"
                      className="w-full px-3 py-2 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs font-mono"
                    />
                  </div>
                )}

                {item.id === "sentry" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
                        Sentry DSN URL
                      </label>
                      <input
                        type="text"
                        value={item.settings.dsn || ""}
                        disabled={isConfigDisabled || isPending}
                        onChange={(e) => handleSettingChange(item.id, "dsn", e.target.value)}
                        placeholder="https://key@o0.ingest.sentry.io/0"
                        className="w-full px-3 py-2 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
                        Environment Tag
                      </label>
                      <input
                        type="text"
                        value={item.settings.environment || "production"}
                        disabled={isConfigDisabled || isPending}
                        onChange={(e) => handleSettingChange(item.id, "environment", e.target.value)}
                        placeholder="production / staging / development"
                        className="w-full px-3 py-2 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs"
                      />
                    </div>
                  </>
                )}

                {item.id === "telemetry_api" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
                        Data Sync Endpoint
                      </label>
                      <input
                        type="text"
                        value={item.settings.endpoint || ""}
                        disabled={isConfigDisabled || isPending}
                        onChange={(e) => handleSettingChange(item.id, "endpoint", e.target.value)}
                        placeholder="https://api.telemetry.internal/v1/sync"
                        className="w-full px-3 py-2 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
                        Sync Interval (Seconds)
                      </label>
                      <input
                        type="number"
                        value={item.settings.sync_interval_seconds || 60}
                        disabled={isConfigDisabled || isPending}
                        onChange={(e) => handleSettingChange(item.id, "sync_interval_seconds", parseInt(e.target.value) || 60)}
                        className="w-full px-3 py-2 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs"
                      />
                    </div>
                  </>
                )}

                {item.id === "stripe_billing" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">
                        Stripe Webhook Secret
                      </label>
                      <input
                        type="password"
                        value={item.settings.webhook_secret || ""}
                        disabled={isConfigDisabled || isPending}
                        onChange={(e) => handleSettingChange(item.id, "webhook_secret", e.target.value)}
                        placeholder="whsec_..."
                        className="w-full px-3 py-2 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id={`sandbox-${item.id}`}
                        checked={item.settings.sandbox_mode ?? true}
                        disabled={isConfigDisabled || isPending}
                        onChange={(e) => handleSettingChange(item.id, "sandbox_mode", e.target.checked)}
                        className="rounded border-black/10 bg-white"
                      />
                      <label 
                        htmlFor={`sandbox-${item.id}`} 
                        className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider cursor-pointer"
                      >
                        Enable Developer Test Sandboxing
                      </label>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Notification messages & Save button */}
            <div className="space-y-2 pt-2 border-t border-black/5 mt-3">
              {successId === item.id && (
                <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold uppercase tracking-wider bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Integration settings updated.
                </div>
              )}
              
              {errorId === item.id && (
                <div className="flex items-start gap-1.5 text-[#b7102a] text-[10px] font-bold uppercase tracking-wider bg-[#b7102a]/10 px-3 py-2 rounded-xl border border-[#b7102a]/15">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg || "Failed to save settings."}</span>
                </div>
              )}

              {!isConfigDisabled && (
                <PrimaryButton
                  onClick={() => handleSave(item)}
                  disabled={isPending}
                  className="mt-1 flex items-center justify-center gap-2 py-2.5 shadow-2xs cursor-pointer text-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Saving settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Integration
                    </>
                  )}
                </PrimaryButton>
              )}
            </div>
          </LiquidGlassSurface>
        );
      })}
    </div>
  );
}
