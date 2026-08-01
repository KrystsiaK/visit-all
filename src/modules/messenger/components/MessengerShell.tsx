"use client";

import { LoaderCircle, MessageSquare } from "lucide-react";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { useMessenger } from "../context/MessengerContext";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { ContactProfile } from "./ContactProfile";
import { MessengerSettings } from "./MessengerSettings";
import { BotAppHome } from "./BotAppHome";
import { ChatThreadPanel } from "./ChatThreadPanel";

export function MessengerShell() {
  const {
    chats, selectedChatId, messages, userProfile, activeTheme,
    loading, messagesLoading, isProfileOpen, activeThreadParentId,
    cachedThreadParent, isSettingsOpen, activeBotTab, activeChat, threadReplies,
    setIsProfileOpen, setIsSettingsOpen, setActiveBotTab, setActiveTheme,
    setActiveThreadParentId,
    handleSelectChat, handleSendMessage, handleSaveProfile, handleToggleReaction,
    handleEditMessage, handleDeleteMessage, handleClearChat, handleSetStatus, handleOpenThread,
  } = useMessenger();

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#f8f6f1] gap-3">
        <LoaderCircle className="w-8 h-8 animate-spin" style={{ color: activeTheme.accentColor }} />
        <span className="text-sm font-bold text-neutral-600">Loading messenger...</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex font-sans">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-neutral-50 z-0" />
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 mix-blend-multiply z-0 animate-pulse"
        style={{ backgroundColor: activeTheme.accentColor, animationDuration: "12s" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 mix-blend-multiply z-0 animate-pulse"
        style={{ backgroundColor: "#a855f7", animationDuration: "16s", animationDelay: "2s" }}
      />

      {/* Left column */}
      <div className="w-72 md:w-[320px] shrink-0 h-full relative z-30">
        {userProfile && (
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            loading={false}
            onSelectChat={handleSelectChat}
            onOpenSettings={() => setIsSettingsOpen(true)}
            currentUserId={userProfile.email}
            activeTheme={activeTheme}
          />
        )}
        {userProfile && (
          <MessengerSettings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            activeTheme={activeTheme}
            onSelectTheme={setActiveTheme}
          />
        )}
      </div>

      {/* Main area */}
      {activeChat ? (
        messagesLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center z-10">
            <LoaderCircle
              className="w-7 h-7 animate-spin"
              style={{ color: activeTheme.accentColor }}
            />
            <span className="text-xs font-bold text-neutral-400 mt-2">Loading conversation...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Bot tab bar */}
            {activeChat.type === "bot" && (
              <div className="bg-white/80 border-b border-black/8 px-4 py-1.5 flex gap-2 shrink-0 z-10">
                {(["messages", "home"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBotTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                      activeBotTab === tab
                        ? "text-white shadow-sm"
                        : "text-neutral-500 hover:bg-black/5"
                    }`}
                    style={activeBotTab === tab ? { backgroundColor: activeTheme.accentColor } : undefined}
                  >
                    {tab === "messages" ? (
                      <MessageSquare className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-sm">⊞</span>
                    )}
                    {tab === "messages" ? "Messages" : "App Home"}
                  </button>
                ))}
              </div>
            )}

            {activeChat.type === "bot" && activeBotTab === "home" && userProfile ? (
              <BotAppHome
                userProfile={userProfile}
                chatCount={chats.length}
                activeTheme={activeTheme}
                onSelectTheme={setActiveTheme}
                onSetStatus={handleSetStatus}
              />
            ) : (
              <ChatWindow
                chat={activeChat}
                messages={messages}
                currentUserId={userProfile?.email || ""}
                isProfileOpen={isProfileOpen}
                activeTheme={activeTheme}
                onToggleProfile={() => {
                  setActiveThreadParentId(null);
                  setIsProfileOpen(!isProfileOpen);
                }}
                onSendMessage={handleSendMessage}
                onToggleReaction={handleToggleReaction}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onClearChat={handleClearChat}
                onOpenThread={handleOpenThread}
                onSelectTheme={setActiveTheme}
                onSetStatus={handleSetStatus}
              />
            )}
          </div>
        )
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center z-10">
          <LiquidGlassSurface
            variant="frosted-glass"
            tone={activeTheme.glassTone}
            effect="amplified"
            className="px-6 py-5 rounded-[24px] shadow-sm flex flex-col items-center max-w-sm text-center border border-black/5"
          >
            <div className="p-3.5 bg-black/5 rounded-2xl mb-3">
              <MessageSquare className="w-6 h-6 text-neutral-700" />
            </div>
            <h3 className="font-extrabold text-sm text-neutral-800">Select a conversation</h3>
            <p className="text-xs leading-5 text-neutral-500 mt-1.5">
              Choose a chat from the list to start messaging or interact with the assistant.
            </p>
          </LiquidGlassSurface>
        </div>
      )}

      {/* Right panels */}
      {activeChat && userProfile && (
        <>
          <ContactProfile
            isOpen={isProfileOpen && !activeThreadParentId}
            chat={activeChat}
            onClose={() => setIsProfileOpen(false)}
            currentUserId={userProfile.email}
            activeTheme={activeTheme}
          />
          {cachedThreadParent && (
            <ChatThreadPanel
              isOpen={!!activeThreadParentId}
              parentMessage={cachedThreadParent}
              replies={threadReplies}
              onSendReply={(content) =>
                handleSendMessage(content, undefined, undefined, activeThreadParentId)
              }
              onClose={() => setActiveThreadParentId(null)}
              currentUserId={userProfile.email}
              activeTheme={activeTheme}
              onToggleReaction={handleToggleReaction}
              onDeleteMessage={handleDeleteMessage}
            />
          )}
        </>
      )}
    </div>
  );
}
