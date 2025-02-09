const express = require("express");
const multer = require("multer");
const supabase = require("../supabaseClient");

const router = express.Router();

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Upload Image & Create Folder (if not exists)
router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const { folder } = req.body;
        const file = req.file;

        if (!folder || !file) return res.status(400).json({ error: "Folder and image are required" });

        const filePath = `${folder}/${Date.now()}-${file.originalname}`;

        const { data, error } = await supabase.storage.from("images").upload(filePath, file.buffer, {
            contentType: file.mimetype
        });

        if (error) throw error;

        const { data: publicURL } = supabase.storage.from("images").getPublicUrl(filePath);

        res.json({ message: "Image uploaded successfully", url: publicURL.publicUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
