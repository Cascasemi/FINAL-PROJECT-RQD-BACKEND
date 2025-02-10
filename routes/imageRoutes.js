const express = require("express");
const supabase = require("../supabaseClient");

const router = express.Router();

// Helper function to generate public URLs for files in a folder
const generatePublicUrls = async (folderName, files) => {
    return files.map(file => {
        const { data } = supabase
            .storage
            .from("images") // Ensure this matches your bucket name
            .getPublicUrl(`${folderName}/${file.name}`);

        return {
            name: file.name,
            publicUrl: data.publicUrl // Correctly extracting `publicUrl`
        };
    });
};

// 📌 Fetch All Images in a Folder with Public URLs
router.get("/folders/:folderName", async (req, res) => {
    try {
        const { folderName } = req.params;

        // Validate folder name
        if (!folderName || !/^[a-zA-Z0-9_-]+$/.test(folderName)) {
            return res.status(400).json({ error: "Invalid folder name. Only letters, numbers, hyphens, and underscores are allowed." });
        }

        // Fetch all files in the folder
        const { data, error } = await supabase.storage.from("images").list(folderName);

        if (error) throw error;

        // Check if the folder is empty
        if (data.length === 0) {
            return res.status(404).json({ error: "Folder is empty or does not exist." });
        }

        // Generate public URLs for the files
        const images = await generatePublicUrls(folderName, data);

        res.json({ images });
    } catch (err) {
        console.error("Error fetching images:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📌 Delete a Single Image
router.delete("/image/:folderName/:imageName", async (req, res) => {
    try {
        const { folderName, imageName } = req.params;

        // Validate folder and image names
        if (!folderName || !/^[a-zA-Z0-9_-]+$/.test(folderName)) {
            return res.status(400).json({ error: "Invalid folder name." });
        }
        if (!imageName || !/^[a-zA-Z0-9_.-]+$/.test(imageName)) {
            return res.status(400).json({ error: "Invalid image name." });
        }

        const filePath = `${folderName}/${imageName}`;

        // Delete the image
        const { error } = await supabase.storage.from("images").remove([filePath]);

        if (error) throw error;

        res.json({ message: "Image deleted successfully" });
    } catch (err) {
        console.error("Error deleting image:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📌 Delete an Entire Folder (All Images)
router.delete("/folder/:folderName", async (req, res) => {
    try {
        const { folderName } = req.params;

        // Validate folder name
        if (!folderName || !/^[a-zA-Z0-9_-]+$/.test(folderName)) {
            return res.status(400).json({ error: "Invalid folder name." });
        }

        // Get all images inside the folder
        const { data, error } = await supabase.storage.from("images").list(folderName);

        if (error) throw error;

        // Check if the folder is empty
        if (data.length === 0) {
            return res.status(404).json({ error: "Folder is empty or does not exist." });
        }

        // Generate file paths for deletion
        const filePaths = data.map(file => `${folderName}/${file.name}`);

        // Delete all files in the folder
        const { error: deleteError } = await supabase.storage.from("images").remove(filePaths);
        if (deleteError) throw deleteError;

        res.json({ message: "Folder and all images deleted successfully" });
    } catch (err) {
        console.error("Error deleting folder:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;