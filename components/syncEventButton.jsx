"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SyncButton() {
  const { data: session } = useSession();
  const [syncStatus, setSyncStatus] = useState("");

  // Sync your own calendar events
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
        setSyncStatus("My calendar events synced successfully!");
      } else {
        setSyncStatus("Failed to sync my calendar events.");
      }
    } catch (error) {
      console.error("Error syncing events:", error);
      setSyncStatus("Error syncing my calendar events.");
    }
  };

  // Sync events from a shared calendar and add them to your own calendar
  const handleSyncSharedEvents = async () => {
    const accessToken = session?.accessToken;
    const refreshToken = session?.refreshToken;
    // Add your shared calendar ID here:
    const sharedCalendarId = "c_f4382a49b61f3edc345ce57c6eb4e95fe90f943b33bf92adafcd9fc561fae4fe@group.calendar.google.com";

    if (!accessToken || !refreshToken) {
      setSyncStatus("No tokens found. Are you signed in?");
      return;
    }

    try {
      const response = await fetch("/api/syncSharedCalendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken, sharedCalendarId }),
      });

      if (response.ok) {
        setSyncStatus("Shared calendar events synced successfully!");
      } else {
        setSyncStatus("Failed to sync shared calendar events.");
      }
    } catch (error) {
      console.error("Error syncing shared events:", error);
      setSyncStatus("Error syncing shared calendar events.");
    }
  };

  if (!session) {
    return (
      <div>
        <h2>Please sign in to sync your calendar.</h2>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome, {session.user.name}!</h2>
      <button onClick={handleSyncEvents}>Sync My Calendar Events</button>
      <button onClick={handleSyncSharedEvents}>Sync Shared Calendar Events</button>
      <p>{syncStatus}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
