require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = supabase;
