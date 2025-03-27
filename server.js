const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Auto-generate JWT_SECRET if not present
if (!process.env.JWT_SECRET) {
    const jwtSecretKey = crypto.randomBytes(64).toString('hex');
    console.log("Generated JWT Secret Key:", jwtSecretKey);

    fs.appendFileSync('.env', `\nJWT_SECRET=${jwtSecretKey}\n`);
    process.env.JWT_SECRET = jwtSecretKey;
}

// Ensure MONGO_URI is correctly loaded
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("MONGO_URI is missing in .env file!");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("Database connection error:", err));

const userRoutes = require('./routes/userRoutes');
const supportRoutes = require('./routes/supportRoutes');

app.use('/api/users', userRoutes);
app.use('/api/support', supportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
