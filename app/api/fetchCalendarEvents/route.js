// app/api/fetchCalendarEvents/route.js
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with the utc and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    // Parse JSON from the request
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
    const supabaseEvents = googleEvents.map((evt) => {
      // Extract raw timestamps from Google event
      const rawStart = evt.start?.dateTime || evt.start?.date;
      const rawEnd = evt.end?.dateTime || evt.end?.date;
      
      return {
        google_id: evt.id,
        title: evt.summary,
        description: evt.description,
        // Convert to Europe/Oslo timezone using dayjs
        date_start: dayjs(rawStart).tz("Europe/Oslo").format(),
        date_end: dayjs(rawEnd).tz("Europe/Oslo").format(),
      };
    });

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
