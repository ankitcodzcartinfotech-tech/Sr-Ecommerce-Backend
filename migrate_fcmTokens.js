const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_DB);
        const db = mongoose.connection.db;
        
        console.log("Updating fcmTokens from array to string...");
        const result = await db.collection('users').updateMany(
            { fcmTokens: { $type: "array" } },
            { $set: { fcmTokens: "" } }
        );
        
        console.log(`Matched ${result.matchedCount} users, modified ${result.modifiedCount} users.`);
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Done.");
        process.exit(0);
    }
}
migrate();
