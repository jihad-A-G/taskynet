import DatabaseConnection from '../config/database';
import { Role, User, Service, Zone, Category, Customer } from '../models';
import 'dotenv/config';

const seedRoles = async () => {
  try {
    // Connect to database
    const dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();

    // Check if roles already exist
    const existingRoles = await Role.find();
    if (existingRoles.length > 0) {
      console.log('🌱 Roles already exist in database');
      return;
    }

    // Create default roles for internet provider
    const roles = [
      { name: 'Admin' },
      { name: 'Manager' },
      { name: 'Technician' },
      { name: 'Collector' },
      { name: 'Customer Service' }
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log('🌱 Successfully seeded roles:', createdRoles.map(role => role.name).join(', '));

  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  }
};

const seedAdmin = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@taskynet.com' });
    if (existingAdmin) {
      console.log('🌱 Admin user already exists');
      return;
    }

    // Get Admin role
    const adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      console.log('❌ Admin role not found. Please seed roles first.');
      return;
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      phoneNumber: '+1234567890',
      address: '123 Main Street, Tech City, TC 12345',
      roleId: adminRole._id,
      email: 'admin@taskynet.com',
      password: 'admin123' // This will be hashed automatically
    });

    await adminUser.save();
    console.log('🌱 Successfully created admin user');
    console.log('📧 Email: admin@taskynet.com');
    console.log('🔐 Password: admin123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

const seedServices = async () => {
  try {
    // Check if services already exist
    const existingServices = await Service.find();
    if (existingServices.length > 0) {
      console.log('🌱 Services already exist in database');
      return;
    }

    // Create default services for internet provider
    const services = [
      { name: 'Basic Internet', cost: 29.99 },
      { name: 'Standard Internet', cost: 49.99 },
      { name: 'Premium Internet', cost: 79.99 },
      { name: 'Business Internet', cost: 149.99 },
      { name: 'Fiber Optic', cost: 99.99 },
      { name: 'Cable Installation', cost: 75.00 },
      { name: 'Router Setup', cost: 25.00 },
      { name: 'Technical Support', cost: 50.00 }
    ];

    const createdServices = await Service.insertMany(services);
    console.log('🌱 Successfully seeded services:', createdServices.map(service => service.name).join(', '));

  } catch (error) {
    console.error('❌ Error seeding services:', error);
  }
};

const seedZones = async () => {
  try {
    // Check if zones already exist
    const existingZones = await Zone.find();
    if (existingZones.length > 0) {
      console.log('🌱 Zones already exist in database');
      return;
    }

    // Create default zones
    const zones = [
      { name: 'North Zone' },
      { name: 'South Zone' },
      { name: 'East Zone' },
      { name: 'West Zone' },
      { name: 'Central Zone' },
      { name: 'Downtown' },
      { name: 'Suburbs' },
      { name: 'Industrial Area' }
    ];

    const createdZones = await Zone.insertMany(zones);
    console.log('🌱 Successfully seeded zones:', createdZones.map(zone => zone.name).join(', '));

  } catch (error) {
    console.error('❌ Error seeding zones:', error);
  }
};

const seedCategories = async () => {
  try {
    // Check if categories already exist
    const existingCategories = await Category.find();
    if (existingCategories.length > 0) {
      console.log('🌱 Categories already exist in database');
      return;
    }

    // Create default task categories
    const categories = [
      { name: 'Installation' },
      { name: 'Maintenance' },
      { name: 'Repair' },
      { name: 'Upgrade' },
      { name: 'Disconnection' },
      { name: 'Technical Support' },
      { name: 'Billing Issue' },
      { name: 'Customer Visit' },
      { name: 'Equipment Return' },
      { name: 'Quality Check' }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('🌱 Successfully seeded categories:', createdCategories.map(category => category.name).join(', '));

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};

const seedSampleCustomers = async () => {
  try {
    // Check if customers already exist
    const existingCustomers = await Customer.find();
    if (existingCustomers.length > 0) {
      console.log('🌱 Customers already exist in database');
      return;
    }

    // Get some services and zones for reference
    const services = await Service.find().limit(3);
    const zones = await Zone.find().limit(3);

    if (services.length === 0 || zones.length === 0) {
      console.log('❌ Please seed services and zones first');
      return;
    }

    // Create sample customers
    const customers = [
      {
        name: 'John Smith',
        location: '123 Main Street, Downtown',
        phoneNumber: '+1234567890',
        serviceId: services[0]!._id,
        zoneId: zones[0]!._id
      },
      {
        name: 'Sarah Johnson',
        location: '456 Oak Avenue, North Zone',
        phoneNumber: '+1234567891',
        serviceId: services[1]!._id,
        zoneId: zones[1]!._id
      },
      {
        name: 'Mike Wilson',
        location: '789 Pine Road, South Zone',
        phoneNumber: '+1234567892',
        serviceId: services[2]!._id,
        zoneId: zones[2]!._id
      },
      {
        name: 'Lisa Davis',
        location: '321 Elm Street, East Zone',
        phoneNumber: '+1234567893',
        serviceId: services[0]!._id,
        zoneId: zones[0]!._id
      },
      {
        name: 'David Brown',
        location: '654 Maple Drive, West Zone',
        phoneNumber: '+1234567894',
        serviceId: services[1]!._id,
        zoneId: zones[1]!._id
      }
    ];

    const createdCustomers = await Customer.insertMany(customers);
    console.log('🌱 Successfully seeded customers:', createdCustomers.map(customer => customer.name).join(', '));

  } catch (error) {
    console.error('❌ Error seeding customers:', error);
  }
};

const runSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await seedRoles();
    await seedServices();
    await seedZones();
    await seedCategories();
    await seedAdmin();
    await seedSampleCustomers();
    
    console.log('🌱 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders();
}

export { seedRoles, seedServices, seedZones, seedCategories, seedAdmin, seedSampleCustomers, runSeeders };
