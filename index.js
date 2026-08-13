require('dotenv').config();

const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { initSocket } = require('./socket.io');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 7410;

// Initialize Socket.IO
initSocket(server);

// Set returnDocument globally
mongoose.set('returnDocument', 'after');

// DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
    console.warn('Unable to set custom DNS servers:', err.message);
}

// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://sr-ecommerce-user.netlify.app'
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (curl, Postman, server-to-server)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// API Routes
const routes = require('./routes/index.routes');
app.use('/api', routes);

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Keshrag Backend API Running Successfully 🚀'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: err.code || err.name,
        stack: err.stack
    });
});

async function migrateSlugs() {
    try {
        const PRODUCT = require('./model/product.model');
        const productsWithoutSlug = await PRODUCT.find({
            $or: [
                { slug: { $exists: false } },
                { slug: null },
                { slug: "" }
            ]
        });

        if (productsWithoutSlug.length > 0) {
            console.log(`Running slug migration for ${productsWithoutSlug.length} products...`);

            const slugify = (text) => {
                return text
                    .toString()
                    .toLowerCase()
                    .trim()
                    .replace(/&/g, '-and-')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            };

            for (const product of productsWithoutSlug) {
                const name = product.productDetail?.name || "Product";
                let slug = slugify(name);
                let uniqueSlug = slug;
                let counter = 1;

                while (true) {
                    const existingProduct = await PRODUCT.findOne({
                        slug: uniqueSlug,
                        _id: { $ne: product._id }
                    });
                    if (!existingProduct) {
                        break;
                    }
                    uniqueSlug = `${slug}-${counter}`;
                    counter++;
                }

                product.slug = uniqueSlug;
                await product.save();
                console.log(`Migrated product "${name}" with slug "${uniqueSlug}"`);
            }
            console.log("Slug migration completed successfully!");
        } else {
            console.log("No slug migration needed.");
        }
    } catch (err) {
        console.error("Error during slug migration:", err);
    }
}

// MongoDB Connection
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_DB);

        console.log('✅ DB is connected...');

        await migrateSlugs();
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
}

connectDB();

// Start Server
server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}...`);
});