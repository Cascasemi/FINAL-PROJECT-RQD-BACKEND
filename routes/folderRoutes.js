const express = require("express");
const supabase = require("../supabaseClient");

const router = express.Router();

// 📌 List All Folders
router.get("/folders", async (req, res) => {
    try {
        // Fetch all files from the storage bucket
        const { data, error } = await supabase.storage.from("images").list("", { limit: 1000 });
        if (error) throw error;

        // Check if data is empty or invalid
        if (!data || data.length === 0) {
            return res.json({ folders: [] }); // Return an empty array if no files are found
        }

        // Extract unique folder names from the file paths
        const folders = [...new Set(data
            .filter(file => file.name && typeof file.name === "string") // Filter out invalid files
            .map(file => {
                const parts = file.name.split("/");
                return parts[0]; // The first part of the path is the folder name
            })
        )];

        // Filter out empty or undefined folder names (if any)
        const validFolders = folders.filter(folder => folder && folder.trim() !== "");

        // Return the list of folder names
        res.json({ folders: validFolders });
    } catch (err) {
        console.error("Error fetching folders:", err.message || err);
        res.status(500).json({ error: `Failed to fetch folders: ${err.message}` });
    }
});

// 📌 List Images Inside a Selected Folder
router.get("/folders/:folderName", async (req, res) => {
    try {
        const { folderName } = req.params;

        // Fetch all files inside the specified folder
        const { data, error } = await supabase.storage.from("images").list(folderName, { limit: 1000 });
        if (error) throw error;

        // Check if data is empty or invalid
        if (!data || data.length === 0) {
            return res.json({ images: [] }); // Return an empty array if no files are found
        }

        // Map files to their public URLs
        const images = data
            .filter(file => file.name && typeof file.name === "string") // Filter out invalid files
            .map(file => ({
                name: file.name,
                url: supabase.storage.from("images").getPublicUrl(`${folderName}/${file.name}`).publicUrl
            }));

        // Return the list of images
        res.json({ images });
    } catch (err) {
        console.error("Error fetching images:", err.message || err);
        res.status(500).json({ error: `Failed to fetch images: ${err.message}` });
    }
});

// 📌 Delete Folder
router.delete("/folders/:folderName", async (req, res) => {
    try {
        const { folderName } = req.params;

        // List all files inside the folder
        const { data: files, error: listError } = await supabase.storage.from("images").list(folderName, { limit: 1000 });
        if (listError) throw listError;

        // Check if the folder is empty or doesn't exist
        if (!files || files.length === 0) {
            return res.status(404).json({ error: "Folder not found or already empty." });
        }

        // Delete each file inside the folder
        const filePaths = files.map(file => `${folderName}/${file.name}`);
        const { error: deleteError } = await supabase.storage.from("images").remove(filePaths);
        if (deleteError) throw deleteError;

        // Return success message
        res.json({ message: `Folder '${folderName}' deleted successfully.` });
    } catch (err) {
        console.error("Error deleting folder:", err.message || err);
        res.status(500).json({ error: `Failed to delete folder: ${err.message}` });
    }
});

module.exports = router;