const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../modules/crm/administration/user.model');
const Role = require('../modules/crm/administration/role.model');
const AuditLog = require('../modules/crm/administration/auditLog.model');
const Lead = require('../modules/crm/leads/lead.model');
const Account = require('../modules/crm/accounts/account.model');
const Contact = require('../modules/crm/contacts/contact.model');
const Opportunity = require('../modules/crm/opportunities/opportunity.model');
const Activity = require('../modules/crm/activities/activity.model');
const Product = require('../modules/crm/sales/product.model');
const Quote = require('../modules/crm/sales/quote.model');
const Order = require('../modules/crm/sales/order.model');
const Campaign = require('../modules/crm/marketing/campaign.model');
const Ticket = require('../modules/crm/customerService/ticket.model');
const Complaint = require('../modules/crm/customerService/complaint.model');
const SlaRule = require('../modules/crm/customerService/sla.model');
const { Workflow, WorkflowExecution } = require('../modules/crm/automation/workflow.model');
const Notification = require('../modules/crm/notifications/notification.model');
const { DEFAULT_PERMISSIONS } = require('../middleware/rbac');

const seedAll = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      AuditLog.deleteMany({}),
      Lead.deleteMany({}),
      Account.deleteMany({}),
      Contact.deleteMany({}),
      Opportunity.deleteMany({}),
      Activity.deleteMany({}),
      Product.deleteMany({}),
      Quote.deleteMany({}),
      Order.deleteMany({}),
      Campaign.deleteMany({}),
      Ticket.deleteMany({}),
      Complaint.deleteMany({}),
      SlaRule.deleteMany({}),
      Workflow.deleteMany({}),
      WorkflowExecution.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('[Seed] Cleared database');

    // 1. Seed Roles
    const rolesData = Object.keys(DEFAULT_PERMISSIONS).map(roleName => ({
      name: roleName,
      description: `Enterprise role granting access to CRM functions for ${roleName}`,
      permissions: Object.keys(DEFAULT_PERMISSIONS[roleName]).map(mod => ({
        module: mod,
        actions: DEFAULT_PERMISSIONS[roleName][mod]
      })),
      isSystem: true
    }));
    await Role.create(rolesData);
    console.log(`[Seed] Seeded ${rolesData.length} Roles`);

    // 2. Seed Users
    const users = await User.create([
      {
        userId: 'USR001',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@crm.internal',
        password: 'Password@123',
        department: 'Sales',
        team: 'Enterprise Direct',
        role: 'Sales Representative',
        phone: '+91 98765 43210'
      },
      {
        userId: 'USR002',
        name: 'Marcus Vance',
        email: 'manager@crm.internal',
        password: 'Password@123',
        department: 'Sales',
        team: 'Global Sales Ops',
        role: 'Sales Manager',
        phone: '+91 98765 43211'
      },
      {
        userId: 'USR003',
        name: 'Alex Morgan',
        email: 'alex.morgan@crm.internal',
        password: 'Password@123',
        department: 'Marketing',
        team: 'Demand Generation',
        role: 'Marketing Lead',
        phone: '+91 98765 43212'
      },
      {
        userId: 'USR004',
        name: 'David Chen',
        email: 'david.chen@crm.internal',
        password: 'Password@123',
        department: 'Customer Service',
        team: 'Tier 2 Enterprise Support',
        role: 'Support Agent',
        phone: '+91 98765 43213'
      },
      {
        userId: 'USR005',
        name: 'Priya Sharma',
        email: 'priya.sharma@crm.internal',
        password: 'Password@123',
        department: 'Management',
        team: 'BI & Strategy',
        role: 'Analyst',
        phone: '+91 98765 43214'
      },
      {
        userId: 'USR000',
        name: 'Super Admin',
        email: 'admin@crm.internal',
        password: 'Password@123',
        department: 'IT',
        team: 'Global Infrastructure',
        role: 'Super Admin',
        phone: '+91 98765 43215'
      }
    ]);
    console.log(`[Seed] Seeded ${users.length} Users`);

    // 3. Seed Accounts
    const accounts = await Account.create([
      {
        accountId: 'ACC-1001',
        companyName: 'Tata Consultancy Services',
        industry: 'Technology',
        website: 'https://tcs.com',
        phone: '+91 22 6778 9999',
        email: 'enterprise-procurement@tcs.com',
        address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        employeeCount: 615000,
        annualRevenue: 28000000000,
        customerType: 'Enterprise',
        customerStatus: 'Active',
        healthScore: 94,
        accountOwner: { userId: 'USR001', name: 'Sarah Jenkins', email: 'sarah.jenkins@crm.internal' },
        aiInsights: [
          { category: 'Opportunity', insight: 'Recent 18% expansion in European banking delivery centers signals upsell potential for Cloud ERP multi-currency modules.', confidence: 0.94 }
        ]
      },
      {
        accountId: 'ACC-1002',
        companyName: 'Reliance Industries',
        industry: 'Manufacturing',
        website: 'https://ril.com',
        phone: '+91 22 3555 5000',
        email: 'digital-supplychain@ril.com',
        address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        employeeCount: 389000,
        annualRevenue: 110000000000,
        customerType: 'Strategic Partner',
        customerStatus: 'Active',
        healthScore: 88,
        accountOwner: { userId: 'USR002', name: 'Marcus Vance', email: 'manager@crm.internal' }
      },
      {
        accountId: 'ACC-1003',
        companyName: 'HDFC Bank Ltd',
        industry: 'Finance',
        website: 'https://hdfcbank.com',
        phone: '+91 22 2498 8484',
        email: 'fintech-it@hdfcbank.com',
        address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        employeeCount: 177000,
        annualRevenue: 22000000000,
        customerType: 'Enterprise',
        customerStatus: 'At Risk',
        healthScore: 62,
        accountOwner: { userId: 'USR001', name: 'Sarah Jenkins', email: 'sarah.jenkins@crm.internal' },
        aiInsights: [
          { category: 'Risk', insight: 'Open critical ticket regarding core ledger API throughput SLA breach. Immediate intervention needed.', confidence: 0.96 }
        ]
      },
      {
        accountId: 'ACC-1004',
        companyName: 'Bharti Airtel',
        industry: 'Telecommunications',
        website: 'https://airtel.in',
        phone: '+91 124 422 2222',
        email: 'cloud-operations@airtel.com',
        address: { city: 'Gurugram', state: 'Haryana', country: 'India' },
        employeeCount: 18000,
        annualRevenue: 17000000000,
        customerType: 'Enterprise',
        customerStatus: 'Active',
        healthScore: 91,
        accountOwner: { userId: 'USR001', name: 'Sarah Jenkins', email: 'sarah.jenkins@crm.internal' }
      },
      {
        accountId: 'ACC-1005',
        companyName: 'Adani Logistics & Ports',
        industry: 'Logistics',
        website: 'https://adaniports.com',
        phone: '+91 79 2656 5555',
        email: 'procurement@adani.com',
        address: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
        employeeCount: 45000,
        annualRevenue: 3200000000,
        customerType: 'Enterprise',
        customerStatus: 'Active',
        healthScore: 89,
        accountOwner: { userId: 'USR002', name: 'Marcus Vance', email: 'manager@crm.internal' }
      }
    ]);
    console.log(`[Seed] Seeded ${accounts.length} Accounts`);

    // 4. Seed Contacts
    const contacts = await Contact.create([
      {
        contactId: 'CON-1001',
        firstName: 'Rajesh',
        lastName: 'Gopinathan',
        email: 'rajesh.g@tcs.com',
        phone: '+91 98111 22334',
        jobTitle: 'VP Global Technology Solutions',
        department: 'Engineering',
        account: accounts[0]._id,
        accountName: accounts[0].companyName,
        isDecisionMaker: true,
        contactOwner: { userId: 'USR001', name: 'Sarah Jenkins' }
      },
      {
        contactId: 'CON-1002',
        firstName: 'Ananya',
        lastName: 'Deshmukh',
        email: 'ananya.deshmukh@ril.com',
        phone: '+91 98222 33445',
        jobTitle: 'Director of Enterprise Architecture',
        department: 'IT Infrastructure',
        account: accounts[1]._id,
        accountName: accounts[1].companyName,
        isDecisionMaker: true,
        contactOwner: { userId: 'USR002', name: 'Marcus Vance' }
      },
      {
        contactId: 'CON-1003',
        firstName: 'Vikram',
        lastName: 'Mehta',
        email: 'vikram.mehta@hdfcbank.com',
        phone: '+91 98333 44556',
        jobTitle: 'Head of Digital Banking & ERP Integration',
        department: 'Digital Systems',
        account: accounts[2]._id,
        accountName: accounts[2].companyName,
        isDecisionMaker: true,
        contactOwner: { userId: 'USR001', name: 'Sarah Jenkins' }
      },
      {
        contactId: 'CON-1004',
        firstName: 'Sunita',
        lastName: 'Rao',
        email: 'sunita.rao@airtel.com',
        phone: '+91 98444 55667',
        jobTitle: 'Chief Procurement Officer',
        department: 'Procurement',
        account: accounts[3]._id,
        accountName: accounts[3].companyName,
        isDecisionMaker: true,
        contactOwner: { userId: 'USR001', name: 'Sarah Jenkins' }
      }
    ]);
    console.log(`[Seed] Seeded ${contacts.length} Contacts`);

    // 5. Seed Leads
    const leads = await Lead.create([
      {
        leadId: 'LED-1001',
        firstName: 'Karan',
        lastName: 'Kapoor',
        company: 'Zomato Operations Hub',
        email: 'karan.kapoor@zomato.internal',
        phone: '+91 98901 12345',
        industry: 'Technology',
        jobTitle: 'VP Supply Chain Technologies',
        leadSource: 'Website',
        campaign: 'Q1 Enterprise Growth',
        leadStatus: 'Qualified',
        leadScore: 85,
        scoreCategory: 'Hot',
        owner: { userId: 'USR001', name: 'Sarah Jenkins', email: 'sarah.jenkins@crm.internal' },
        qualification: {
          budget: '₹25,00,000 - ₹50,00,000',
          requirement: 'End-to-end ERP and Vendor Management CRM',
          timeline: '1-3 Months',
          decisionMaker: true,
          companySize: '5000+ Employees',
          productInterest: 'Enterprise ERP Suite'
        },
        activitiesSummary: { emailsOpened: 4, websiteVisits: 6, demoRequested: true, replied: true }
      },
      {
        leadId: 'LED-1002',
        firstName: 'Meera',
        lastName: 'Nambiar',
        company: 'Apollo Hospitals Group',
        email: 'meera.nambiar@apollohospitals.internal',
        phone: '+91 98902 23456',
        industry: 'Healthcare',
        jobTitle: 'Chief Technology Officer',
        leadSource: 'Event',
        campaign: 'Healthcare IT Conclave 2026',
        leadStatus: 'In Progress',
        leadScore: 78,
        scoreCategory: 'Hot',
        owner: { userId: 'USR001', name: 'Sarah Jenkins', email: 'sarah.jenkins@crm.internal' },
        qualification: {
          budget: '₹50,00,000+',
          requirement: 'Hospital inventory allocation & patient billing bridge',
          timeline: 'Immediate',
          decisionMaker: true,
          companySize: '10,000+ Employees',
          productInterest: 'Agentic CRM Module'
        },
        activitiesSummary: { emailsOpened: 3, websiteVisits: 4, demoRequested: true, replied: true }
      },
      {
        leadId: 'LED-1003',
        firstName: 'Rohit',
        lastName: 'Verma',
        company: 'Nykaa E-Retail Logistics',
        email: 'rohit.verma@nykaa.internal',
        phone: '+91 98903 34567',
        industry: 'Technology',
        jobTitle: 'Head of Operations Tech',
        leadSource: 'Referral',
        campaign: 'Executive Referral Circle',
        leadStatus: 'Contacted',
        leadScore: 60,
        scoreCategory: 'Warm',
        owner: { userId: 'USR002', name: 'Marcus Vance', email: 'manager@crm.internal' },
        qualification: {
          budget: '₹15,00,000 - ₹25,00,000',
          requirement: 'Multi-warehouse CRM order orchestration',
          timeline: '3-6 Months',
          decisionMaker: false,
          companySize: '1500 Employees',
          productInterest: 'Cloud Analytics Platform'
        },
        activitiesSummary: { emailsOpened: 2, websiteVisits: 2, demoRequested: false, replied: true }
      },
      {
        leadId: 'LED-1004',
        firstName: 'Deepak',
        lastName: 'Singhal',
        company: 'Larsen & Toubro Heavy Eng',
        email: 'deepak.singhal@larsentoubro.internal',
        phone: '+91 98904 45678',
        industry: 'Manufacturing',
        jobTitle: 'Procurement Specialist',
        leadSource: 'Advertisement',
        campaign: 'LinkedIn Enterprise Inbound',
        leadStatus: 'New',
        leadScore: 35,
        scoreCategory: 'Cold',
        owner: { userId: 'USR001', name: 'Sarah Jenkins', email: 'sarah.jenkins@crm.internal' },
        qualification: {
          budget: 'None',
          requirement: 'General inquiry on pricing sheet',
          timeline: 'Unknown',
          decisionMaker: false,
          companySize: '50,000+ Employees',
          productInterest: 'Enterprise ERP Core'
        },
        activitiesSummary: { emailsOpened: 1, websiteVisits: 1, demoRequested: false, replied: false }
      },
      {
        leadId: 'LED-1005',
        firstName: 'Pooja',
        lastName: 'Bhatt',
        company: 'Swiggy Instamart Delivery Tech',
        email: 'pooja.bhatt@swiggy.internal',
        phone: '+91 98905 56789',
        industry: 'Technology',
        jobTitle: 'Director of Fleet Operations',
        leadSource: 'Website',
        campaign: 'Q1 Enterprise Growth',
        leadStatus: 'Qualified',
        leadScore: 92,
        scoreCategory: 'Hot',
        owner: { userId: 'USR001', name: 'Sarah Jenkins', email: 'sarah.jenkins@crm.internal' },
        qualification: {
          budget: '₹35,00,000',
          requirement: 'Agentic CRM ticketing and live partner SLAs',
          timeline: '1-3 Months',
          decisionMaker: true,
          companySize: '6000 Employees',
          productInterest: 'Enterprise ERP Suite'
        },
        activitiesSummary: { emailsOpened: 5, websiteVisits: 8, demoRequested: true, replied: true }
      }
    ]);
    console.log(`[Seed] Seeded ${leads.length} Leads`);

    // 6. Seed Opportunities
    const opportunities = await Opportunity.create([
      {
        opportunityId: 'OPP-1001',
        name: 'TCS - Enterprise Cloud ERP Modernization',
        account: accounts[0]._id,
        accountName: accounts[0].companyName,
        primaryContact: contacts[0]._id,
        contactName: `${contacts[0].firstName} ${contacts[0].lastName}`,
        owner: { userId: 'USR001', name: 'Sarah Jenkins' },
        pipeline: 'Standard Enterprise Pipeline',
        stage: 'Proposal',
        amount: 850000,
        probability: 60,
        expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        product: 'Enterprise ERP Suite',
        source: 'Executive Referral',
        competitor: 'SAP S/4HANA',
        nextAction: 'Deliver commercial proposal and license terms to VP Global Solutions',
        stageHistory: [
          { fromStage: 'New', toStage: 'Qualification', movedBy: 'Sarah Jenkins', movedAt: new Date(Date.now() - 30 * 24 * 3600000) },
          { fromStage: 'Qualification', toStage: 'Discovery', movedBy: 'Sarah Jenkins', movedAt: new Date(Date.now() - 20 * 24 * 3600000) },
          { fromStage: 'Discovery', toStage: 'Proposal', movedBy: 'Sarah Jenkins', movedAt: new Date(Date.now() - 5 * 24 * 3600000) }
        ]
      },
      {
        opportunityId: 'OPP-1002',
        name: 'Reliance Industries - Warehouse Automation CRM',
        account: accounts[1]._id,
        accountName: accounts[1].companyName,
        primaryContact: contacts[1]._id,
        contactName: `${contacts[1].firstName} ${contacts[1].lastName}`,
        owner: { userId: 'USR002', name: 'Marcus Vance' },
        pipeline: 'Standard Enterprise Pipeline',
        stage: 'Negotiation',
        amount: 1450000,
        probability: 80,
        expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        product: 'Enterprise ERP Suite',
        source: 'Strategic Inbound',
        competitor: 'Salesforce Enterprise',
        nextAction: 'Legal counsel review on multi-year master service agreement'
      },
      {
        opportunityId: 'OPP-1003',
        name: 'HDFC Bank - Agentic AI Support Co-pilot',
        account: accounts[2]._id,
        accountName: accounts[2].companyName,
        primaryContact: contacts[2]._id,
        contactName: `${contacts[2].firstName} ${contacts[2].lastName}`,
        owner: { userId: 'USR001', name: 'Sarah Jenkins' },
        pipeline: 'Standard Enterprise Pipeline',
        stage: 'Discovery',
        amount: 420000,
        probability: 40,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        product: 'Agentic CRM Module',
        source: 'Website',
        competitor: 'Microsoft Dynamics 365',
        nextAction: 'Schedule technical deep dive with security architecture team'
      },
      {
        opportunityId: 'OPP-1004',
        name: 'Bharti Airtel - 5G Billing & CRM Expansion',
        account: accounts[3]._id,
        accountName: accounts[3].companyName,
        primaryContact: contacts[3]._id,
        contactName: `${contacts[3].firstName} ${contacts[3].lastName}`,
        owner: { userId: 'USR001', name: 'Sarah Jenkins' },
        pipeline: 'Standard Enterprise Pipeline',
        stage: 'Closed Won',
        amount: 1200000,
        probability: 100,
        expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        product: 'Enterprise ERP Suite',
        source: 'Campaign Inbound',
        winLossReason: 'Superior agentic workflow automation and native ERP integration.'
      },
      {
        opportunityId: 'OPP-1005',
        name: 'Adani Logistics - Freight CRM Cloud',
        account: accounts[4]._id,
        accountName: accounts[4].companyName,
        owner: { userId: 'USR002', name: 'Marcus Vance' },
        pipeline: 'Standard Enterprise Pipeline',
        stage: 'Qualification',
        amount: 680000,
        probability: 20,
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        product: 'Cloud Analytics Platform',
        source: 'Partner Channel'
      },
      {
        opportunityId: 'OPP-1006',
        name: 'Legacy FinTech Group - Migrated Legacy Stack',
        account: accounts[2]._id,
        accountName: accounts[2].companyName,
        owner: { userId: 'USR001', name: 'Sarah Jenkins' },
        pipeline: 'Standard Enterprise Pipeline',
        stage: 'Closed Lost',
        amount: 350000,
        probability: 0,
        expectedCloseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        product: 'Agentic CRM Module',
        source: 'Cold Call',
        winLossReason: 'Project deferred to fiscal year 2027 due to internal budget freeze.'
      }
    ]);
    console.log(`[Seed] Seeded ${opportunities.length} Opportunities`);

    // 7. Seed Products
    const products = await Product.create([
      {
        name: 'Nexoraa Enterprise AI-Powered ERP Core Suite',
        sku: 'ERP-CORE-ENT',
        category: 'Software Licenses',
        description: 'Comprehensive ERP engine managing Finance, Sales, Inventory, and Supply Chain',
        price: 500000,
        tax: 18,
        discount: 10,
        status: 'Active',
        stockAvailable: 500
      },
      {
        name: 'Nexoraa AI-Powered CRM Pro Edition',
        sku: 'CRM-AGENTIC-PRO',
        category: 'Software Licenses',
        description: 'AI-native CRM with autonomous Sales, Lead, Customer, and Support agents',
        price: 250000,
        tax: 18,
        discount: 5,
        status: 'Active',
        stockAvailable: 1000
      },
      {
        name: 'Enterprise Cloud Analytics & BI Add-on',
        sku: 'BI-ANALYTICS-CLOUD',
        category: 'Cloud Subscriptions',
        description: 'Real-time pipeline analytics, revenue forecasting, and executive reporting suite',
        price: 150000,
        tax: 18,
        discount: 0,
        status: 'Active',
        stockAvailable: 2000
      },
      {
        name: 'White Glove Implementation & Migration Services',
        sku: 'SRV-IMPL-ENTERPRISE',
        category: 'Implementation Services',
        description: 'Dedicated solution architects and data migration engineers for zero-downtime go-live',
        price: 180000,
        tax: 18,
        discount: 0,
        status: 'Active',
        stockAvailable: 50
      },
      {
        name: '24/7 Mission-Critical SLA Support Package',
        sku: 'SUP-MISSION-CRITICAL',
        category: 'Support & Maintenance',
        description: 'Guaranteed 2-hour resolution SLA for Critical incidents with assigned Technical Account Manager',
        price: 120000,
        tax: 18,
        discount: 0,
        status: 'Active',
        stockAvailable: 100
      }
    ]);
    console.log(`[Seed] Seeded ${products.length} Products`);

    // 8. Seed Quotes
    const quotes = await Quote.create([
      {
        quoteNumber: 'QTE-2026-1001',
        account: accounts[0]._id,
        customerName: accounts[0].companyName,
        opportunity: opportunities[0]._id,
        opportunityName: opportunities[0].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, sku: products[0].sku, unitPrice: 500000, quantity: 1, discount: 5, tax: 18, lineTotal: 475000 },
          { productId: products[1]._id, productName: products[1].name, sku: products[1].sku, unitPrice: 250000, quantity: 1, discount: 0, tax: 18, lineTotal: 250000 }
        ],
        subtotal: 725000,
        discountAmount: 25000,
        taxAmount: 130500,
        total: 855500,
        status: 'Sent',
        createdBy: { userId: 'USR001', name: 'Sarah Jenkins' }
      },
      {
        quoteNumber: 'QTE-2026-1002',
        account: accounts[3]._id,
        customerName: accounts[3].companyName,
        opportunity: opportunities[3]._id,
        opportunityName: opportunities[3].name,
        items: [
          { productId: products[0]._id, productName: products[0].name, sku: products[0].sku, unitPrice: 500000, quantity: 2, discount: 10, tax: 18, lineTotal: 900000 },
          { productId: products[3]._id, productName: products[3].name, sku: products[3].sku, unitPrice: 180000, quantity: 1, discount: 0, tax: 18, lineTotal: 180000 }
        ],
        subtotal: 1080000,
        discountAmount: 100000,
        taxAmount: 194400,
        total: 1274400,
        status: 'Accepted',
        createdBy: { userId: 'USR001', name: 'Sarah Jenkins' }
      }
    ]);
    console.log(`[Seed] Seeded ${quotes.length} Quotes`);

    // 9. Seed Orders
    const orders = await Order.create([
      {
        orderNumber: 'ORD-2026-1001',
        account: accounts[3]._id,
        customerName: accounts[3].companyName,
        quote: quotes[1]._id,
        quoteNumber: quotes[1].quoteNumber,
        items: quotes[1].items,
        subtotal: quotes[1].subtotal,
        discountAmount: quotes[1].discountAmount,
        taxAmount: quotes[1].taxAmount,
        total: quotes[1].total,
        orderDate: new Date(Date.now() - 5 * 24 * 3600000),
        status: 'Confirmed',
        erpSync: {
          syncedWithErp: true,
          inventoryAllocated: true,
          invoiceGenerated: true,
          financePaymentStatus: 'Paid',
          erpReferenceId: 'ERP-SO-948201'
        },
        owner: { userId: 'USR001', name: 'Sarah Jenkins' }
      },
      {
        orderNumber: 'ORD-2026-1002',
        account: accounts[1]._id,
        customerName: accounts[1].companyName,
        items: [
          { productId: products[1]._id, productName: products[1].name, sku: products[1].sku, unitPrice: 250000, quantity: 2, discount: 5, tax: 18, lineTotal: 475000 }
        ],
        subtotal: 475000,
        discountAmount: 25000,
        taxAmount: 85500,
        total: 560500,
        orderDate: new Date(Date.now() - 15 * 24 * 3600000),
        status: 'Completed',
        erpSync: {
          syncedWithErp: true,
          inventoryAllocated: true,
          invoiceGenerated: true,
          financePaymentStatus: 'Paid',
          erpReferenceId: 'ERP-SO-817293'
        },
        owner: { userId: 'USR002', name: 'Marcus Vance' }
      }
    ]);
    console.log(`[Seed] Seeded ${orders.length} Orders`);

    // 10. Seed Activities
    const activities = await Activity.create([
      {
        activityId: 'ACT-1001',
        type: 'Meeting',
        subject: 'Architecture Review with TCS VP Rajesh Gopinathan',
        description: 'Walkthrough of Nexoraa AI-Powered ERP inventory synchronization and JWT RBAC architecture.',
        relatedTo: {
          account: { id: accounts[0]._id, name: accounts[0].companyName },
          opportunity: { id: opportunities[0]._id, name: opportunities[0].name }
        },
        assignedUser: { userId: 'USR001', name: 'Sarah Jenkins' },
        activityDate: new Date(Date.now() + 24 * 3600000),
        dueDate: new Date(Date.now() + 24 * 3600000),
        status: 'Pending',
        priority: 'High'
      },
      {
        activityId: 'ACT-1002',
        type: 'Call',
        subject: 'Contract Negotiation with Reliance Procurement Lead',
        description: 'Discussed volume discount and multi-year cloud SLA commitments.',
        relatedTo: {
          account: { id: accounts[1]._id, name: accounts[1].companyName },
          opportunity: { id: opportunities[1]._id, name: opportunities[1].name }
        },
        assignedUser: { userId: 'USR002', name: 'Marcus Vance' },
        activityDate: new Date(Date.now() - 2 * 24 * 3600000),
        status: 'Completed',
        priority: 'High',
        outcome: 'Agreement reached on 10% software volume tier discount.'
      },
      {
        activityId: 'ACT-1003',
        type: 'Task',
        subject: 'Follow-up with Zomato regarding demo feedback',
        description: 'Verify if VP Supply Chain had questions on automated lead scoring and pipeline forecasts.',
        relatedTo: {
          lead: { id: leads[0]._id, name: `${leads[0].firstName} ${leads[0].lastName}` }
        },
        assignedUser: { userId: 'USR001', name: 'Sarah Jenkins' },
        activityDate: new Date(),
        dueDate: new Date(Date.now() + 48 * 3600000),
        status: 'Pending',
        priority: 'Medium'
      },
      {
        activityId: 'ACT-1004',
        type: 'Note',
        subject: 'HDFC Security Compliance Notes',
        description: 'HDFC InfoSec team requires RBAC audit logs with IP tracking for all deal conversions.',
        relatedTo: {
          account: { id: accounts[2]._id, name: accounts[2].companyName }
        },
        assignedUser: { userId: 'USR001', name: 'Sarah Jenkins' },
        activityDate: new Date(Date.now() - 4 * 24 * 3600000),
        status: 'Completed'
      }
    ]);
    console.log(`[Seed] Seeded ${activities.length} Activities`);

    // 11. Seed Campaigns
    const campaigns = await Campaign.create([
      {
        campaignId: 'CMP-1001',
        name: 'Q1 Enterprise Digital Transformation',
        type: 'Email',
        startDate: new Date(Date.now() - 30 * 24 * 3600000),
        endDate: new Date(Date.now() + 30 * 24 * 3600000),
        budget: 500000,
        actualSpend: 320000,
        targetAudience: 'CIOs, CTOs, and IT Directors in APAC',
        leadSource: 'Email',
        status: 'Active',
        metrics: {
          sent: 12500,
          delivered: 12200,
          opened: 4880,
          clicked: 1950,
          replied: 420,
          converted: 38,
          revenueGenerated: 4200000
        }
      },
      {
        campaignId: 'CMP-1002',
        name: 'Next-Gen Nexoraa AI-Powered ERP Webinar 2026',
        type: 'Webinar',
        startDate: new Date(Date.now() - 15 * 24 * 3600000),
        endDate: new Date(Date.now() + 15 * 24 * 3600000),
        budget: 250000,
        actualSpend: 180000,
        targetAudience: 'Operations Leaders & VP Finance',
        leadSource: 'Social Media',
        status: 'Active',
        metrics: {
          sent: 8400,
          delivered: 8100,
          opened: 3200,
          clicked: 1400,
          replied: 280,
          converted: 24,
          revenueGenerated: 2850000
        }
      }
    ]);
    console.log(`[Seed] Seeded ${campaigns.length} Campaigns`);

    // 12. Seed Customer Service (Tickets, Complaints, SLA)
    const tickets = await Ticket.create([
      {
        ticketId: 'TCK-1001',
        account: accounts[2]._id,
        customerName: accounts[2].companyName,
        contact: contacts[2]._id,
        contactName: `${contacts[2].firstName} ${contacts[2].lastName}`,
        subject: 'Core Ledger API Integration Latency Spike',
        description: 'Outbound REST API latency exceeding 2500ms on bulk journal synchronization.',
        category: 'Technical',
        priority: 'Critical',
        status: 'In Progress',
        assignedAgent: { userId: 'USR004', name: 'David Chen' },
        sla: {
          targetHours: 2,
          breached: false,
          slaDueAt: new Date(Date.now() + 1.5 * 3600000)
        }
      },
      {
        ticketId: 'TCK-1002',
        account: accounts[0]._id,
        customerName: accounts[0].companyName,
        subject: 'Invoice GST breakdown configuration for Karnataka SEZ unit',
        description: 'Need assistance setting up multi-state tax rates for new development hub.',
        category: 'Billing',
        priority: 'Medium',
        status: 'Open',
        assignedAgent: { userId: 'USR004', name: 'David Chen' },
        sla: {
          targetHours: 8,
          breached: false,
          slaDueAt: new Date(Date.now() + 6 * 3600000)
        }
      },
      {
        ticketId: 'TCK-1003',
        account: accounts[3]._id,
        customerName: accounts[3].companyName,
        subject: 'Initial Sandbox API Key Provisioning',
        description: 'Sandbox API keys generated and validated across test environments.',
        category: 'Account Management',
        priority: 'Low',
        status: 'Resolved',
        assignedAgent: { userId: 'USR004', name: 'David Chen' },
        sla: {
          targetHours: 24,
          breached: false,
          slaDueAt: new Date(Date.now() - 10 * 3600000)
        },
        resolution: {
          description: 'Issued production JWT tokens and credentials in encrypted portal.',
          resolvedBy: 'David Chen',
          resolvedAt: new Date(Date.now() - 5 * 3600000),
          customerFeedback: 'Fast and responsive turnaround.',
          satisfactionScore: 5
        }
      }
    ]);
    console.log(`[Seed] Seeded ${tickets.length} Tickets`);

    await Complaint.create([
      {
        complaintId: 'CMPL-1001',
        account: accounts[2]._id,
        customerName: accounts[2].companyName,
        category: 'Service Outage',
        description: 'Intermittent timeout in test environment during UAT session.',
        severity: 'High',
        assignedAgent: { userId: 'USR004', name: 'David Chen' },
        status: 'Investigating'
      }
    ]);

    await SlaRule.create([
      { priority: 'Critical', targetResolutionHours: 2, escalationAfterHours: 1, notifyRoles: ['Support Manager', 'Super Admin'] },
      { priority: 'High', targetResolutionHours: 4, escalationAfterHours: 2, notifyRoles: ['Support Manager'] },
      { priority: 'Medium', targetResolutionHours: 8, escalationAfterHours: 4, notifyRoles: ['Support Agent'] },
      { priority: 'Low', targetResolutionHours: 24, escalationAfterHours: 12, notifyRoles: ['Support Agent'] }
    ]);
    console.log('[Seed] Seeded SLA rules and complaints');

    // 13. Seed Automation Workflows
    const workflows = await Workflow.create([
      {
        name: 'High Scoring Lead VIP Assignment & Task Dispatch',
        description: 'When lead score exceeds 70, automatically dispatch high-priority follow-up task and notify rep.',
        isActive: true,
        trigger: {
          type: 'LEAD_SCORE_CHANGED',
          entity: 'Lead'
        },
        condition: {
          field: 'leadScore',
          operator: '>=',
          value: 70
        },
        actions: [
          { actionType: 'CREATE_TASK', params: { priority: 'High', subject: 'Urgent: VIP Outreach for High Score Lead' } },
          { actionType: 'SEND_NOTIFICATION', params: { title: 'VIP Hot Lead Alert', message: 'Lead scored over 70. Fast-track demo booking.' } }
        ],
        executionCount: 8,
        lastExecutedAt: new Date()
      },
      {
        name: 'High Value Deal Executive Approval Gate',
        description: 'When opportunity value exceeds ₹5,00,000, trigger mandatory sales management sign-off.',
        isActive: true,
        trigger: {
          type: 'OPPORTUNITY_AMOUNT_HIGH',
          entity: 'Opportunity'
        },
        condition: {
          field: 'amount',
          operator: '>',
          value: 500000
        },
        actions: [
          { actionType: 'REQUIRE_APPROVAL', params: {} },
          { actionType: 'SEND_NOTIFICATION', params: { title: 'Deal Approval Needed', message: 'High value proposal requires executive review.' } }
        ],
        executionCount: 5,
        lastExecutedAt: new Date()
      }
    ]);
    console.log(`[Seed] Seeded ${workflows.length} Workflows`);

    // 14. Seed Notifications
    await Notification.create([
      {
        recipientUserId: 'USR001',
        title: 'New Hot Lead Assigned',
        message: 'Lead Karan Kapoor (Zomato Operations) assigned to you with score 85/100.',
        type: 'lead_assignment',
        entityType: 'Lead',
        entityId: 'LED-1001',
        isRead: false
      },
      {
        recipientUserId: 'USR001',
        title: 'Deal Stage Progressed to Proposal',
        message: 'TCS - Enterprise Cloud ERP Modernization moved to Proposal stage.',
        type: 'deal_stage',
        entityType: 'Opportunity',
        entityId: 'OPP-1001',
        isRead: false
      },
      {
        recipientUserId: 'USR002',
        title: 'High Value Approval Pending',
        message: 'Reliance Warehouse Automation CRM (₹14,50,000) awaits discount authorization.',
        type: 'approval',
        entityType: 'Opportunity',
        entityId: 'OPP-1002',
        isRead: false
      }
    ]);
    console.log('[Seed] Seeded Notifications');

    // 15. Seed Audit Logs
    await AuditLog.create([
      {
        user: { userId: 'USR001', name: 'Sarah Jenkins', email: 'sarah.jenkins@crm.internal', role: 'Sales Representative' },
        action: 'CREATE',
        module: 'leads',
        entity: 'Lead',
        entityId: 'LED-1001',
        details: 'Captured inbound lead Karan Kapoor from Enterprise Web Portal'
      },
      {
        user: { userId: 'USR002', name: 'Marcus Vance', email: 'manager@crm.internal', role: 'Sales Manager' },
        action: 'STAGE_CHANGE',
        module: 'opportunities',
        entity: 'Opportunity',
        entityId: 'OPP-1002',
        details: 'Stage changed from Discovery -> Negotiation. Agreed on volume terms.'
      },
      {
        user: { userId: 'SYSTEM', name: 'AI Orchestrator', email: 'system@crm.internal', role: 'System' },
        action: 'AI_TOOL_EXECUTION',
        module: 'aiAgentCenter',
        entity: 'AiTask',
        entityId: 'AI-TASK-001',
        details: 'Sales Agent synthesized deal win probabilities and recommended executive alignment'
      }
    ]);
    console.log('[Seed] Seeded Initial Audit Logs');

    console.log('\n=============================================');
    console.log('CRM Database Seeding Completed Successfully!');
    console.log('=============================================\n');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedAll();
