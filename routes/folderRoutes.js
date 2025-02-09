const express = require("express");
const supabase = require("../supabaseClient");

const router = express.Router();

// 📌 List All Folders
router.get("/folders", async (req, res) => {
    try {
        const { data, error } = await supabase.storage.from("images").list("", { limit: 1000 });

        if (error) throw error;

        const folders = [...new Set(data.map(file => file.name.split("/")[0]))];

        res.json({ folders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 List Images Inside a Selected Folder
router.get("/folders/:folderName", async (req, res) => {
    try {
        const { folderName } = req.params;
        const { data, error } = await supabase.storage.from("images").list(folderName, { limit: 1000 });

        if (error) throw error;

        const images = data.map(file => ({
            name: file.name,
            url: supabase.storage.from("images").getPublicUrl(`${folderName}/${file.name}`).publicUrl
        }));

        res.json({ images });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
