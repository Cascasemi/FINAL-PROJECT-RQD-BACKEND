require("dotenv").config();
const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");
const folderRoutes = require("./routes/folderRoutes");
const imageRoutes = require("./routes/imageRoutes");
const addUserRoute = require("./routes/addUser"); // Include new route
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(uploadRoutes);
app.use(folderRoutes);
app.use(imageRoutes);
app.use(addUserRoute); // Add new user route
app.use(authRoutes); // Enable login route

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
