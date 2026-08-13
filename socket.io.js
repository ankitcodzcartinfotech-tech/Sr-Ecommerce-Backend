const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./model/user.model');
const Admin = require('./model/admin.model');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3002',
                'http://localhost:3003',
                process.env.FRONTEND_URL
            ].filter(Boolean),
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingInterval: 25000,
        pingTimeout: 20000,
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000
        }
    });

    // Socket.IO authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication required'));
            }

            // Verify JWT token — synchronous, no DB hit
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Query User and Admin in parallel — cuts auth latency in half
            const [user, admin] = await Promise.all([
                User.findById(decoded.id).select('-password').lean(),
                Admin.findById(decoded.id).select('-password').lean()
            ]);

            const principal = user || admin;
            const isAdmin = !user && !!admin;

            if (!principal) {
                return next(new Error('User not found'));
            }

            socket.user    = principal;
            socket.isAdmin = isAdmin;
            socket.userId  = principal._id.toString();

            next();
        } catch (error) {
            return next(new Error('Invalid token'));
        }
    });

    // Handle new socket connection
    io.on('connection', async (socket) => {
        console.log(`[Socket] ${socket.isAdmin ? 'Admin' : 'User'} connected: ${socket.userId}`);

        // Join user room
        const userRoom = `user_${socket.userId}`;
        socket.join(userRoom);
        console.log(`[Socket] Joined room: ${userRoom}`);

        // If admin, join admin room
        if (socket.isAdmin) {
            const adminRoom = 'admin_notifications';
            socket.join(adminRoom);
            console.log(`[Socket] Admin joined admin room`);
        }

        // --------------------
        // User Event Handlers
        // --------------------
        socket.on('notification:read', async (notificationId) => {
            try {
                const Notification = require('./model/notification.model');
                const notification = await Notification.findById(notificationId);
                
                if (notification && notification.user.toString() === socket.userId) {
                    notification.isRead = true;
                    notification.readAt = new Date();
                    await notification.save();
                    
                    // Emit to user's room that notification is read
                    io.to(userRoom).emit('notification:read_confirmed', notificationId);
                }
            } catch (error) {
                console.error('[Socket] Error marking notification as read:', error);
            }
        });

        socket.on('notification:read_all', async () => {
            try {
                const Notification = require('./model/notification.model');
                await Notification.updateMany(
                    { user: socket.userId, isAdmin: false, isRead: false },
                    { isRead: true, readAt: new Date() }
                );
                
                io.to(userRoom).emit('notification:all_read');
            } catch (error) {
                console.error('[Socket] Error marking all notifications as read:', error);
            }
        });

        socket.on('notification:delete', async (notificationId) => {
            try {
                const Notification = require('./model/notification.model');
                await Notification.findByIdAndDelete(notificationId);
                
                io.to(userRoom).emit('notification:deleted', notificationId);
            } catch (error) {
                console.error('[Socket] Error deleting notification:', error);
            }
        });

        // --------------------
        // Order Event Handlers
        // --------------------
        socket.on('order:join', (orderId) => {
            const orderRoom = `order_${orderId}`;
            socket.join(orderRoom);
            console.log(`[Socket] Joined order room: ${orderRoom}`);
        });

        socket.on('order:leave', (orderId) => {
            const orderRoom = `order_${orderId}`;
            socket.leave(orderRoom);
            console.log(`[Socket] Left order room: ${orderRoom}`);
        });

        // --------------------
        // Handle Disconnect
        // --------------------
        socket.on('disconnect', (reason) => {
            console.log(`[Socket] ${socket.isAdmin ? 'Admin' : 'User'} disconnected: ${socket.userId}, reason: ${reason}`);
        });
    });

    console.log('[Socket.IO] Server initialized');
    return io;
};

// Get existing io instance
const getIo = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};

// Emit notification to user room
const emitToUser = (userId, event, data) => {
    if (!io) {
        console.warn(`[Socket] emitToUser called before Socket.IO was initialized (event: '${event}')`);
        return;
    }
    const userRoom = `user_${userId}`;
    io.to(userRoom).emit(event, data);
    console.log(`[Socket] Emitted '${event}' to user ${userId}`);
};

// Emit to all admins
const emitToAdmins = (event, data) => {
    if (!io) {
        console.warn(`[Socket] emitToAdmins called before Socket.IO was initialized (event: '${event}')`);
        return;
    }
    const adminRoom = 'admin_notifications';
    io.to(adminRoom).emit(event, data);
    console.log(`[Socket] Emitted '${event}' to all admins`);
};

// Emit to order room
const emitToOrderRoom = (orderId, event, data) => {
    if (!io) {
        console.warn(`[Socket] emitToOrderRoom called before Socket.IO was initialized (event: '${event}')`);
        return;
    }
    const orderRoom = `order_${orderId}`;
    io.to(orderRoom).emit(event, data);
    console.log(`[Socket] Emitted '${event}' to order room ${orderId}`);
};

module.exports = {
    initSocket,
    getIo,
    emitToUser,
    emitToAdmins,
    emitToOrderRoom
};
