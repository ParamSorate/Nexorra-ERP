const Product = require('./product.model');
const Quote = require('./quote.model');
const Order = require('./order.model');
const { successResponse, errorResponse } = require('../../../utils/response');
const { logAudit } = require('../../../middleware/auditLogger');
const Notification = require('../notifications/notification.model');

// Products
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: { $ne: 'Discontinued' } }).sort({ name: 1 });
    return successResponse(res, 'Products catalog retrieved', products);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await logAudit({ req, action: 'CREATE', module: 'sales', entity: 'Product', entityId: product.sku, newValue: product.toObject() });
    return successResponse(res, 'Product created successfully', product, 201);
  } catch (error) {
    next(error);
  }
};

// Quotes
const getQuotes = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    const quotes = await Quote.find(filter).sort({ createdAt: -1 });
    return successResponse(res, 'Quotes retrieved successfully', quotes);
  } catch (error) {
    next(error);
  }
};

const createQuote = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.quoteNumber) {
      const count = await Quote.countDocuments();
      data.quoteNumber = `QTE-2026-${1000 + count + 1}`;
    }
    data.createdBy = { userId: req.user.userId, name: req.user.name };
    const quote = await Quote.create(data);
    await logAudit({ req, action: 'CREATE', module: 'sales', entity: 'Quote', entityId: quote.quoteNumber, newValue: quote.toObject() });
    return successResponse(res, 'Quote created successfully', quote, 201);
  } catch (error) {
    next(error);
  }
};

const updateQuoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const quote = await Quote.findById(id);
    if (!quote) return errorResponse(res, 'Quote not found', 404);

    const prevStatus = quote.status;
    quote.status = status;
    await quote.save();

    await logAudit({
      req,
      action: 'UPDATE',
      module: 'sales',
      entity: 'Quote',
      entityId: quote.quoteNumber,
      details: `Quote status transitioned from ${prevStatus} to ${status}`
    });

    // Auto convert to Order if Quote is Accepted
    let generatedOrder = null;
    if (status === 'Accepted') {
      const ordCount = await Order.countDocuments();
      generatedOrder = await Order.create({
        orderNumber: `ORD-2026-${1000 + ordCount + 1}`,
        account: quote.account,
        customerName: quote.customerName,
        quote: quote._id,
        quoteNumber: quote.quoteNumber,
        items: quote.items,
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        taxAmount: quote.taxAmount,
        total: quote.total,
        status: 'Confirmed',
        erpSync: {
          syncedWithErp: true,
          inventoryAllocated: true,
          invoiceGenerated: false,
          financePaymentStatus: 'Unpaid',
          erpReferenceId: `ERP-SO-${Math.floor(100000 + Math.random() * 900000)}`
        },
        owner: { userId: req.user.userId, name: req.user.name }
      });

      await Notification.create({
        recipientUserId: req.user.userId,
        title: 'Quote Accepted & Order Generated',
        message: `Quote #${quote.quoteNumber} accepted. Sales Order #${generatedOrder.orderNumber} auto-generated for ${quote.customerName}`,
        type: 'deal_stage',
        entityType: 'Order',
        entityId: generatedOrder.orderNumber
      });
    }

    return successResponse(res, `Quote updated to ${status}`, { quote, generatedOrder });
  } catch (error) {
    next(error);
  }
};

// Orders
const getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    const orders = await Order.find(filter).sort({ orderDate: -1 });
    return successResponse(res, 'Orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.orderNumber) {
      const count = await Order.countDocuments();
      data.orderNumber = `ORD-2026-${1000 + count + 1}`;
    }
    data.owner = { userId: req.user.userId, name: req.user.name };
    const order = await Order.create(data);
    await logAudit({ req, action: 'CREATE', module: 'sales', entity: 'Order', entityId: order.orderNumber, newValue: order.toObject() });
    return successResponse(res, 'Order created successfully', order, 201);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, erpSync } = req.body;
    const order = await Order.findById(id);
    if (!order) return errorResponse(res, 'Order not found', 404);

    if (status) order.status = status;
    if (erpSync) order.erpSync = { ...order.erpSync, ...erpSync };
    await order.save();

    await logAudit({ req, action: 'UPDATE', module: 'sales', entity: 'Order', entityId: order.orderNumber, details: `Order status set to ${status}` });
    return successResponse(res, 'Order updated successfully', order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  createProduct,
  getQuotes,
  createQuote,
  updateQuoteStatus,
  getOrders,
  createOrder,
  updateOrderStatus
};
