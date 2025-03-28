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
          const { data, error } = await supabase
            .from("events")
            .select("*"); // or specify columns explicitly
      
          if (error) {
            console.error("Error fetching events:", error);
            return;
          }
      
          if (data) {
            const transformed = data.map((evt) => {
              // If date_start is present, use it; otherwise fall back to date
              const start = evt.date_start || evt.date;
              const end = evt.date_end || evt.date; 
              // If you only have "date" and no "date_end," set both start & end to the same date
      
              return {
                title: evt.title,
                start: start,
                end: end,
                description: evt.description,
                // ...any other fields FullCalendar might need
              };
            });
      
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
            timeZone="Europe/Copenhagen"
            />

        </div>
    );
}