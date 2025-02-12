require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Add a new user (Admin Only)
router.post("/add-user", async (req, res) => {
    try {
        const { name, username, password, role } = req.body;

        // Validate input
        if (!name || !username || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into Supabase
        const { data, error } = await supabase
            .from("users")
            .insert([{ name, username, password: hashedPassword, role }]);

        if (error) throw error;

        res.status(201).json({ message: "User added successfully", user: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
