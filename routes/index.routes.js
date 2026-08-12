const express = require('express');
const route = express.Router();

const adminRoutes = require('./Admin/index.routes');
const userRoutes = require('./User/index.routes');

route.use('/admin', adminRoutes);
route.use('/user', userRoutes);

module.exports = route;