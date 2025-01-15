const express = require("express");
const connectDatabase = require("./database/database");
const dotenv = require("dotenv");
const cors = require("cors");
const acceptFormData = require('express-fileupload');

// Creating an express application
const app = express();

// Configure CORS Policy
const corsOptions = {
    origin: true,
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));

// Express JSON Config
app.use(express.json());

// Config form data
app.use(acceptFormData());

// Make a static public folder
app.use(express.static("./public"));

// dotenv configuration
dotenv.config();

// Defining the port
const PORT = process.env.PORT || 5000;

// Connecting to Database
connectDatabase();

// Making a test endpoint
app.get("/test", (req, res) => {
    res.send("Test API is working..");
});

// Configuring Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/appointment', require('./routes/appointmentRoutes')); // Updated route
app.use('/api/doctor', require('./routes/doctorRoutes')); // Updated route
app.use('/api/rating', require("./routes/reviewRoutes"));
app.use('/api/myplan', require("./routes/myplanRoutes")); // Updated route
app.use('/api/contact', require('./routes/contactRoutes'));

const path = require('path');

// Serve the doctors folder under the public directory
app.use('/doctors', express.static(path.join(__dirname, 'public/doctors')));


// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}!`);
});

module.exports = app;
