import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { initDB } from './db.js';

// Middlewares
import { globalLimiter } from './middleware/rateLimiter.js';
import { auditLogger } from './middleware/auditLogger.js';

// Routers
import appRouter from './routes/app.js';
import authRouter from './routes/auth.js';
import customerRouter from './routes/customer.js';
import addressesRouter from './routes/addresses.js';
import homeRouter from './routes/home.js';
import categoriesRouter from './routes/categories.js';
import couponsRouter from './routes/coupons.js';
import bookingsRouter from './routes/bookings.js';
import paymentRouter from './routes/payment.js';
import walletRouter from './routes/wallet.js';
import chatsRouter from './routes/chats.js';
import notificationsRouter from './routes/notifications.js';
import supportRouter from './routes/support.js';
import rewardsRouter from './routes/rewards.js';
import staticRouter from './routes/static.js';
import uploadRouter from './routes/upload.js';
import deviceRouter from './routes/device.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Enable HTTP Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline resources for Swagger UI
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable Cross-Origin Resource Sharing (CORS) for React and Flutter
app.use(cors());

// Apply Global IP Rate Limiter
app.use(globalLimiter);

// Request Audit Logging
app.use(auditLogger);

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Media Files Statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ==========================================
// Swagger OpenAPI Documentation Setup
// ==========================================
if (fs.existsSync('./swagger-spec.json')) {
  const swaggerDocs = JSON.parse(fs.readFileSync('./swagger-spec.json', 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// Serve raw OpenAPI JSON for Postman automatic link import & sync
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'swagger-spec.json'));
});

// Base checking endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Ghar Ka Sathi Production API service is healthy and secure.',
    time: new Date().toISOString()
  });
});

// ==========================================
// Bind Router Endpoints under /api/v1
// ==========================================
app.use('/api/v1/app', appRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/address', addressesRouter);
app.use('/api/v1/home', homeRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/coupon', couponsRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/bookings', chatsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/support', supportRouter);
app.use('/api/v1/referral', rewardsRouter);
app.use('/api/v1/rewards', rewardsRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/device', deviceRouter);
app.use('/api/v1/sessions', deviceRouter);
app.use('/', staticRouter);

// Standard 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: `Endpoint ${req.originalUrl} not found on this server.`
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: err.message || 'Internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize database tables, then run HTTP listener
const startServer = async () => {
  console.log('Initializing database migrations...');
  await initDB();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🏠 Ghar Ka Sathi Production Server Active!`);
    console.log(`🚀 Running at http://localhost:${PORT}`);
    console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`===============================================`);
  });
};

startServer();
