// app/api/syncSharedCalendar/route.js
import { google } from "googleapis";
import { NextResponse } from "next/server";

// This route expects a POST request with a JSON body containing:
// {
//   accessToken: string,
//   refreshToken: string,
//   sharedCalendarId: string
// }
export async function POST(request) {
  try {
    const { accessToken, refreshToken, sharedCalendarId } = await request.json();
    if (!accessToken || !refreshToken || !sharedCalendarId) {
      return NextResponse.json(
        { error: "Missing tokens or sharedCalendarId" },
        { status: 400 }
      );
    }
    
    // Create an OAuth2 client using your environment variables.
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    
    // Create a calendar API instance.
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    // Fetch events from the shared calendar.
    const eventsResponse = await calendar.events.list({
      calendarId: sharedCalendarId, // The shared calendar's ID.
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    
    const events = eventsResponse.data.items || [];
    
    if (events.length === 0) {
      return NextResponse.json({ message: "No events to sync." }, { status: 200 });
    }
    
    // Loop through the events and insert each one into your own calendar (using "primary").
    const insertedEvents = [];
    for (const event of events) {
      const insertResponse = await calendar.events.insert({
        calendarId: "primary", // Your own calendar.
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
          // You can add additional fields as needed.
        },
      });
      insertedEvents.push(insertResponse.data);
    }
    
    return NextResponse.json(
      { message: "Events copied successfully.", insertedEvents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync events." }, { status: 500 });
  }
}
