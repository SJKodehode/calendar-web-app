"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"

const sampleEvents = [
    { title: "Meeting", date: "2025-04-01" },
    { title: "Conference", date: "2025-04-07" },
];

export default function CalendarDisplay ({ events = sampleEvents}) {
    return (
        <div style={{ padding: "2rem"}}>
            <h1>My Calendar</h1>
            <FullCalendar 
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            />
        </div>
    );
}