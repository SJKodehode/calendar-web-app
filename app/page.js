"use client";
import CalendarDisplay from "@/components/calendarDisplay";
import AddEventButton from "@/components/addEventButton";
import SyncButton from "@/components/syncEventButton";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="">
      <h1 className="flex text-4xl font-bold text-center mt-20 justify-center">Kodehode Calendar app</h1>
      <AddEventButton />
      <SessionProvider>
      <SyncButton />
      </SessionProvider>
      <CalendarDisplay />
    </main>
  );
}
