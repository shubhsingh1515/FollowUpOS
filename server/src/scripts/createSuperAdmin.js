import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { logger } from '../utils/logger.js';

async function createSuperAdmin() {
  try {
    await connectDatabase();

    const email = process.env.SUPER_ADMIN_EMAIL || process.argv[2] || 'admin@followupos.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || process.argv[3] || 'SuperAdmin@FollowUpOS2026';
    const name = process.env.SUPER_ADMIN_NAME || 'FollowUpOS Super Admin';

    logger.info(`Checking super admin account for: ${email}`);

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.platformRole = 'super_admin';
      user.role = 'owner';
      user.isEmailVerified = true;
      user.passwordHash = await User.hashPassword(password);
      await user.save();
      logger.info(`✓ Existing user ${email} upgraded to super_admin`);
    } else {
      let org = await Organization.findOne({ slug: 'followupos-hq' });
      if (!org) {
        org = await Organization.create({
          name: 'FollowUpOS Platform HQ',
          slug: 'followupos-hq',
          plan: 'agency',
          industry: 'saas_headquarters',
          settings: { subscriptionStatus: 'active' }
        });
      }

      user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash: await User.hashPassword(password),
        role: 'owner',
        platformRole: 'super_admin',
        isEmailVerified: true,
        organizationId: org._id
      });

      logger.info(`✓ Super admin created successfully: ${email}`);
    }

    console.log('\n========================================');
    console.log('✓ SUPER ADMIN BOOTSTRAP COMPLETE');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('Role:     super_admin');
    console.log('Access:   /admin portal');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    logger.error('Failed to create super admin:', err.message);
    process.exit(1);
  }
}

createSuperAdmin();
