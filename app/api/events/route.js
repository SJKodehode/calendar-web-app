import { createClient } from "@supabase/supabase-js";

const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseURL, supabaseAnonKey);

export async function POST(request) {
    try {
        const { title, description, date, url } = await request.json();

        if (!title || !date) {
            return new Response(
                JSON.stringify({ sucess: false, error: "Missing required fields"}),
                {status: 400, headers: {"Content-Type": "application/json" } }
            );
        }
        const { data, error } = await supabase
        .from("events")
        .insert([{ title, description, date, url}])
        .select();

        if (error) {
            throw error;
        }

        return new Response(
            JSON.stringify({ sucess: true, event: data[0] }),
            { status: 200, headers: {"Content-Type": "application/json"} }
        );
    } catch (error) {
        console.error("error inserting event:", error);
        return new Response(
            JSON.stringify({sucess: false, error: error.message}),
            {status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    

}