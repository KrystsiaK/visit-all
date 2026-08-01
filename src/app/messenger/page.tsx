import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUserProfile } from "@/app/actions";
import { MessengerProvider } from "@/modules/messenger/context/MessengerContext";
import { MessengerShell } from "@/modules/messenger/components/MessengerShell";

export default async function MessengerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let initialProfile = null;
  try {
    initialProfile = await getCurrentUserProfile();
  } catch {
    // Profile will be fetched client-side on init
  }

  return (
    <MessengerProvider initialProfile={initialProfile}>
      <MessengerShell />
    </MessengerProvider>
  );
}