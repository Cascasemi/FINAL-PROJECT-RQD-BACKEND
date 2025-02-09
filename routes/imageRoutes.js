const express = require("express");
const supabase = require("../supabaseClient");

const router = express.Router();

/**
 * 📌 Fetch Public URLs of Files in a Folder
 */
router.get("/folders/:folderName", async (req, res) => {
    try {
        const { folderName } = req.params;

        // Fetch all files in the folder
        const { data, error } = await supabase.storage.from("images").list(folderName);

        if (error) throw error;

        // Generate public URLs for each file
        const publicUrls = data.map((file) => {
            return supabase.storage
                .from("images")
                .getPublicUrl(`${folderName}/${file.name}`).data.publicUrl;
        });

        res.json({
            publicUrls,
            count: publicUrls.length,
            folderName,
        });
    } catch (err) {
        console.error("Error fetching public URLs:", err);
        res.status(500).json({ error: "Failed to fetch public URLs", details: err.message });
    }
});

module.exports = router;