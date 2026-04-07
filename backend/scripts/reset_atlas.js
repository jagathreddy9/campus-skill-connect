const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Force using system DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI;

async function run() {
    try {
        console.log("Attempting to connect to:", MONGO_URI.split('@')[1]);
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
            family: 4
        });
        console.log("Connected Successfully.");
        
        const collections = await mongoose.connection.db.collections();
        for (const col of collections) {
            console.log(`Clearing ${col.collectionName}...`);
            await col.deleteMany({});
        }
        console.log("Database reset successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

run();
