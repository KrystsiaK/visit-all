"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) { alert("Invalid credentials. Try again!"); } 
      else { window.location.href = "/"; }
    } catch { alert("System Authentication Node Offline."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col md:flex-row font-sans">
      
      {/* Bauhaus Architectural Left Panel */}
      <div className="flex-1 bg-[#00327d] flex flex-col justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b7102a] -mr-16 -mt-16 mix-blend-multiply opacity-90" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ffdf9b] -ml-24 -mb-24 mix-blend-multiply opacity-90" />
        
        <div className="relative z-10 max-w-xl border-l-[12px] border-white pl-8">
          <h1 className="text-6xl md:text-7xl lg:text-[7rem] font-bold tracking-tighter uppercase font-display leading-[0.85] text-[#f9f9f9]">
            DIGITAL<br />CURATOR
          </h1>
          <p className="mt-8 text-xl lg:text-2xl font-medium text-white/90 font-sans tracking-wide max-w-md">
            A modernist exhibition space for your geographic memories and trajectories.
          </p>
        </div>
      </div>

      {/* Structured Right Panel */}
      <div className="flex-1 bg-white flex flex-col justify-center p-12 lg:p-24 relative shadow-[-20px_0_40px_rgba(0,0,0,0.05)] border-l border-gray-200">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 font-display uppercase tracking-tight">Access Gallery</h2>
            <div className="h-1.5 w-16 bg-[#b7102a] mt-6"></div>
          </div>

          <form className="space-y-8" onSubmit={handleAuth}>
            <div className="group relative">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 transition-colors group-focus-within:text-[#00327d]">Identity Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#f3f3f3] text-gray-900 border-b-[3px] border-transparent focus:border-[#00327d] focus:bg-white transition-all rounded-none outline-none font-medium placeholder-gray-400"
                placeholder="curator@atelier.com"
              />
            </div>

            <div className="group relative">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 transition-colors group-focus-within:text-[#00327d]">Access Key</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#f3f3f3] text-gray-900 border-b-[3px] border-transparent focus:border-[#b7102a] focus:bg-white transition-all rounded-none outline-none font-black placeholder-gray-400 text-lg tracking-widest"
                placeholder="••••"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 text-sm font-bold text-white bg-[#00327d] hover:bg-[#001f4d] uppercase tracking-[0.2em] rounded-none transition-colors outline-none flex justify-center items-center gap-3 mt-4"
            >
              {loading ? "Authenticating..." : "Enter Exhibition"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
