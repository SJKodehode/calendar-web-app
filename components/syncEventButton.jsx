"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SyncButton() {
  const { data: session } = useSession();
  const [syncStatus, setSyncStatus] = useState("");

  // Function to sync calendar events
  const handleSyncEvents = async () => {
    const accessToken = session?.accessToken;
    const refreshToken = session?.refreshToken;

    if (!accessToken || !refreshToken) {
      setSyncStatus("No tokens found. Are you signed in?");
      return;
    }

    try {
      const response = await fetch("/api/fetchCalendarEvents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken }),
      });

      if (response.ok) {
        setSyncStatus("Events synced successfully!");
      } else {
        setSyncStatus("Failed to sync events.");
      }
    } catch (error) {
      console.error("Error syncing events:", error);
      setSyncStatus("Error syncing events.");
    }
  };

  // If user is NOT signed in, show "Sign in with Google" button
  if (!session) {
    return (
      <div>
        <h2>Please sign in to sync your calendar.</h2>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </div>
    );
  }

  // If user IS signed in, show sync button and sign-out
  return (
    <div>
      <h2>Welcome, {session.user.name}!</h2>
      <button onClick={handleSyncEvents}>Sync Google Calendar Events</button>
      <p>{syncStatus}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
