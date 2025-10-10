const { PrismaClient } = require('@prisma/client');

// Use a singleton PrismaClient to avoid exhausting connections in dev/hot-reload
const prisma = global.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;

module.exports = prisma;
