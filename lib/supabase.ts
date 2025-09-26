import { createClient } from "@supabase/supabase-js";

// Get these from your Supabase dashboard → Project Settings → API
const SUPABASE_URL = "https://gqmiqfvfyyzwpgvpebgk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ibAhGqifdo9xfKzaAPRqNA_stq7Bu2-";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
