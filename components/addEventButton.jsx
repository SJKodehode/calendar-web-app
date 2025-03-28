"use client";

import { useState } from "react";

export default function AddEventButton() {
    const [status, setStatus] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [url, setUrl] = useState("");

    async function handleAddEvent(e) {
        e.preventDefault();
        setStatus("Adding event...");

        const eventData = { title, description, date, url };
        
        try {
            const res = await fetch("api/events", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(eventData),
            });
            const result = await res.json();

            if (res.ok) {
                setStatus("Event added sucessfully!");
            } else {
                setStatus("Failed to add event: " + result.error);
            }
        } catch (error) {
            setStatus("Error: " + error.message);
        }
    }
    return (
        <div className="sm:flex sm:justify-center max-w-full">

        <form onSubmit={handleAddEvent} style={{ padding: "2rem"}} className="sm:flex border-4 bg-amber-200 mx-10 border-amber-300 rounded-2xl my-8 sm:gap-8">
            <h2 className="font-bold text-lg ">Add an Event</h2>
            <div>
                <p className=" m-w-40">Title:</p>
                <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                type="text"
                className=" rounded-lg bg-amber-100 border-2 border-amber-300 w-56"
                />
            </div>
            <div>
                <p className=" m-w-40">Description:</p>
                <input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                type="text"
                className=" rounded-lg bg-amber-100 border-2 border-amber-300 w-56"

                 />
            </div>
            <div>
                <p className=" m-w-40">Date:</p>
                <input 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                type="datetime-local" 
                className=" rounded-lg bg-amber-100 border-2 border-amber-300 w-56"
                />
            </div>
            <div>
                <p className=" m-w-40">Link:</p>
                <input 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                type="url" 
                className=" rounded-lg bg-amber-100 border-2 border-amber-300 w-56"
                />
            </div>
            <button type="submit">Add Event</button>
            <p>{status}</p>
        </form>
        </div>
    );
}