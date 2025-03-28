import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { accessToken, refreshToken } = req.body;

  if (!accessToken || !refreshToken) {
    return res.status(400).json({ error: "Missing tokens" });
  }

  try {
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

    // Upsert the events into Supabase, using google_id as the conflict key.
    const { error } = await supabase
      .from("events")
      .upsert(supabaseEvents, { onConflict: "google_id" });

    if (error) throw error;

    res.status(200).json({ message: "Events synced successfully." });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Failed to sync events." });
  }
}
