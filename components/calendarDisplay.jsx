"use client";

import {useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridWeek from "@fullcalendar/timegrid"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CalendarDisplay () {
    const handleDateClick = (arg) => {
        alert(arg.dateStr)
      }
    
    const [calendarEvents, setCalendarEvents] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const { data } = await supabase.from("events").select("*");
            if (data) {
                const transformed = data.map((evt) => ({
                    title: evt.title,
                    date: evt.date,
                    description: evt.description,
                    url: evt.url,
                }));
                setCalendarEvents(transformed);
            }
        }
        fetchData();
    }, []);

    return (
        <div style={{ padding: "2rem"}}>
            <h1>My Calendar</h1>
            <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridWeek]}
            initialView="dayGridMonth"
            headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'timeGridWeek,dayGridMonth',
            }}
            events={calendarEvents}
            slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }}
            eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }}
            timeZone="Local"
            />

        </div>
    );
}