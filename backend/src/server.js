const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

// Import Module Routes
const authRoutes = require('./modules/crm/administration/admin.routes');
const dashboardRoutes = require('./modules/crm/dashboard/dashboard.routes');
const leadRoutes = require('./modules/crm/leads/lead.routes');
const accountRoutes = require('./modules/crm/accounts/account.routes');
const contactRoutes = require('./modules/crm/contacts/contact.routes');
const opportunityRoutes = require('./modules/crm/opportunities/opportunity.routes');
const activityRoutes = require('./modules/crm/activities/activity.routes');
const salesRoutes = require('./modules/crm/sales/sales.routes');
const marketingRoutes = require('./modules/crm/marketing/marketing.routes');
const serviceRoutes = require('./modules/crm/customerService/service.routes');
const automationRoutes = require('./modules/crm/automation/workflow.routes');
const reportRoutes = require('./modules/crm/reports/reports.routes');
const aiRoutes = require('./ai/ai.routes');
const notificationRoutes = require('./modules/crm/notifications/notification.routes');
const erpRoutes = require('./modules/crm/integrations/erpIntegration.routes');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend dev server and production clients
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'Enterprise CRM Module',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// Mount CRM API Routes
app.use('/api/crm/auth', authRoutes);
app.use('/api/crm/dashboard', dashboardRoutes);
app.use('/api/crm/leads', leadRoutes);
app.use('/api/crm/accounts', accountRoutes);
app.use('/api/crm/contacts', contactRoutes);
app.use('/api/crm/opportunities', opportunityRoutes);
app.use('/api/crm/activities', activityRoutes);
app.use('/api/crm/sales', salesRoutes);
app.use('/api/crm/marketing', marketingRoutes);
app.use('/api/crm/service', serviceRoutes);
app.use('/api/crm/automation', automationRoutes);
app.use('/api/crm/reports', reportRoutes);
app.use('/api/crm/ai', aiRoutes);
app.use('/api/crm/admin', authRoutes); // Users, roles, audit-logs
app.use('/api/crm/notifications', notificationRoutes);
app.use('/api/crm/integrations', erpRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await connectDB();
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Enterprise CRM API Server Running on Port: ${PORT}`);
    console.log(` MongoDB URI: ${config.mongoUri}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

startServer();

module.exports = app;
