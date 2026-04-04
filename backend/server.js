const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/records", require("./routes/recordRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));