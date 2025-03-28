// app/api/fetchCalendarEvents/route.js
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    // In the App Router, you parse JSON from the request like this:
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    const googleEvents = response.data.items || [];
    const supabaseEvents = googleEvents.map((evt) => ({
      google_id: evt.id,
      title: evt.summary,
      description: evt.description,
      date_start: evt.start?.dateTime || evt.start?.date,
      date_end: evt.end?.dateTime || evt.end?.date,
    }));

    // Upsert into Supabase
    const { error } = await supabase
      .from("events")
      .upsert(supabaseEvents, { onConflict: "google_id" });

    if (error) throw error;

    return NextResponse.json({ message: "Events synced successfully." });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Failed to sync events." }, { status: 500 });
  }
}
