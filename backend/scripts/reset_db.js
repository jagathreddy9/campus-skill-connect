const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("Error: MONGO_URI not found in .env file.");
    process.exit(1);
}

const resetDatabase = async () => {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected Successfully.");

        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            console.log(`Clearing collection: ${collection.collectionName}`);
            await collection.deleteMany({});
        }

        console.log("\nDATABASE RESET COMPLETE! All users, messages, and requests have been cleared.");
        console.log("You can now perform fresh registrations. ✨");

        await mongoose.connection.close();
    } catch (err) {
        console.error("Database Reset Error:", err);
        process.exit(1);
    }
};

resetDatabase();
