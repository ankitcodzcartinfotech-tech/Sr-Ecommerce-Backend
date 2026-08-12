require('dotenv').config();
const mongoose = require('mongoose');
const UserOrder = require('./model/userOrder.model');

async function migrateOrders() {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_DB);
    console.log('Database connected!');

    // Find all orders without orderNumber
    const ordersWithoutNumber = await UserOrder.find({ orderNumber: { $exists: false } });
    console.log(`Found ${ordersWithoutNumber.length} orders without order numbers`);

    // Find all orders with old ORD-* format
    const ordersWithOldFormat = await UserOrder.find({ orderNumber: { $regex: /^ORD-/ } });
    console.log(`Found ${ordersWithOldFormat.length} orders with old format`);

    const ordersToMigrate = [...ordersWithoutNumber, ...ordersWithOldFormat];

    // Group orders by date (YYYYMMDD)
    const ordersByDate = {};

    for (const order of ordersToMigrate) {
        const date = order.createdAt || new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}${month}${day}`;

        if (!ordersByDate[dateKey]) {
            ordersByDate[dateKey] = [];
        }
        ordersByDate[dateKey].push(order);
    }

    // Process each date
    for (const [dateKey, orders] of Object.entries(ordersByDate)) {
        // Sort orders by createdAt
        orders.sort((a, b) => (a.createdAt || new Date()) - (b.createdAt || new Date()));

        // Find the last order with KRG- format for this date
        const prefix = `KRG-${dateKey}-`;
        const lastExistingOrder = await UserOrder.findOne(
            { orderNumber: { $regex: `^${prefix}` } },
            {},
            { sort: { orderNumber: -1 } }
        );

        let sequenceNum = 1;
        if (lastExistingOrder) {
            const lastSeq = parseInt(lastExistingOrder.orderNumber.split('-').pop());
            sequenceNum = lastSeq + 1;
        }

        // Update each order
        for (const order of orders) {
            const newOrderNumber = `${prefix}${String(sequenceNum).padStart(4, '0')}`;
            await UserOrder.updateOne(
                { _id: order._id },
                { $set: { orderNumber: newOrderNumber } }
            );
            console.log(`Updated order ${order._id} to ${newOrderNumber}`);
            sequenceNum++;
        }
    }

    console.log('Migration completed!');
    await mongoose.connection.close();
}

migrateOrders().catch(console.error);
