require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Utility function for consistent error responses
 */
const sendErrorResponse = (res, statusCode, message) => {
  console.error(message); // Log the error for debugging
  res.status(statusCode).json({ message });
};

/**
 * Add a new user (Admin Only)
 */
router.post("/add-user", async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password || !role) {
      return sendErrorResponse(res, 400, "All fields are required: name, username, password, role");
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .limit(1);

    if (fetchError) return sendErrorResponse(res, 500, "Failed to check for existing user");
    if (existingUser && existingUser.length > 0) return sendErrorResponse(res, 400, "Username already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, username, password: hashedPassword, role }]);

    if (error) return sendErrorResponse(res, 500, "Failed to add user: " + error.message);

    res.status(201).json({ message: "User added successfully", user: data });
  } catch (error) {
    sendErrorResponse(res, 500, "Internal server error: " + error.message);
  }
});

/**
 * Get all users (Exclude Admins)
 */
router.get("/get-users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, username, role, created_at")
      .neq("role", "admin"); // Exclude admin users

    if (error) return sendErrorResponse(res, 500, "Failed to fetch users: " + error.message);

    res.status(200).json({ message: "Users fetched successfully", users: data });
  } catch (error) {
    sendErrorResponse(res, 500, "Internal server error: " + error.message);
  }
});

/**
 * Delete a user (Admin Only)
 */
router.delete("/delete-user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .limit(1);

    if (fetchError) return sendErrorResponse(res, 500, "Failed to fetch user: " + fetchError.message);
    if (!user || user.length === 0) return sendErrorResponse(res, 404, "User not found");

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) return sendErrorResponse(res, 500, "Failed to delete user: " + error.message);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    sendErrorResponse(res, 500, "Internal server error: " + error.message);
  }
});

/**
 * Change user password
 */
router.put("/change-password", async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
      return sendErrorResponse(res, 400, "All fields are required: username, oldPassword, newPassword");
    }

    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("id, password")
      .eq("username", username)
      .limit(1);

    if (fetchError) return sendErrorResponse(res, 500, "Failed to fetch user: " + fetchError.message);
    if (!users || users.length === 0) return sendErrorResponse(res, 404, "User not found");

    const user = users[0];

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) return sendErrorResponse(res, 401, "Incorrect old password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", user.id);

    if (updateError) return sendErrorResponse(res, 500, "Failed to update password: " + updateError.message);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    sendErrorResponse(res, 500, "Internal server error: " + error.message);
  }
});

module.exports = router;
