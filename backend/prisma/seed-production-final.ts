import { execSync } from 'child_process';

async function main() {
    console.log('🚀 Starting Production Database Seeding...');
    console.log('----------------------------------------');

    try {
        // 1. Restore Departments
        console.log('\n1️⃣  Restoring Departments...');
        execSync('npx tsx prisma/restore-all-departments.ts', { stdio: 'inherit' });

        // 2. Seed Officers
        console.log('\n2️⃣  Seeding Officers...');
        execSync('npx tsx prisma/seed-officers.ts', { stdio: 'inherit' });

        // 3. Seed Complaints
        console.log('\n3️⃣  Seeding Complaints...');
        execSync('npx tsx prisma/seed-complaints.ts', { stdio: 'inherit' });

        console.log('\n----------------------------------------');
        console.log('✅ Production Seeding Completed Successfully!');
        console.log('----------------------------------------');

    } catch (error) {
        console.error('\n❌ Seeding Failed:', error);
        process.exit(1);
    }
}

main();
