require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// User Login Route
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const { data: users, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .limit(1);

        if (error) throw error;
        if (!users || users.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = users[0];

        // Compare password with the hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Return role for role-based access control
        res.json({ message: "Login successful", role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
