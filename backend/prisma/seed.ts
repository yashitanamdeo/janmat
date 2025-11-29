import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    try {
        await prisma.complaintTimeline.deleteMany();
        await prisma.attachment.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.complaint.deleteMany();
        await prisma.user.deleteMany();
    } catch (error) {
        console.warn('⚠️ Warning: Failed to clear some tables (might be empty already)');
    }

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create Users
    console.log('👥 Creating users...');

    const citizen = await prisma.user.create({
        data: {
            id: '1',
            name: 'John Doe',
            email: 'citizen@test.com',
            password: hashedPassword,
            role: 'CITIZEN',
            isVerified: true,
        },
    });

    const officer = await prisma.user.create({
        data: {
            id: '2',
            name: 'Officer Smith',
            email: 'officer@test.com',
            password: hashedPassword,
            role: 'OFFICER',
            isVerified: true,
        },
    });

    const admin = await prisma.user.create({
        data: {
            id: '3',
            name: 'Admin User',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true,
        },
    });

    // Create additional officers
    const officer2 = await prisma.user.create({
        data: {
            id: '4',
            name: 'Officer Johnson',
            email: 'officer2@test.com',
            password: hashedPassword,
            role: 'OFFICER',
            isVerified: true,
        },
    });

    const officer3 = await prisma.user.create({
        data: {
            id: '5',
            name: 'Officer Williams',
            email: 'officer3@test.com',
            password: hashedPassword,
            role: 'OFFICER',
            isVerified: true,
        },
    });

    console.log('✅ Created 5 users (1 citizen, 3 officers, 1 admin)');

    // Create Complaints
    console.log('📋 Creating complaints...');

    const complaints = [
        {
            id: 'c1',
            title: 'Broken Street Light on Main Street',
            description: 'The street light near the park has been broken for a week, making the area unsafe at night.',
            urgency: 'HIGH' as any,
            status: 'PENDING' as any,
            location: '40.7128,-74.0060',
            userId: citizen.id,
            assignedTo: officer.id,
        },
        {
            id: 'c2',
            title: 'Pothole on Highway 101',
            description: 'Large pothole causing traffic issues and potential vehicle damage.',
            urgency: 'MEDIUM' as any,
            status: 'IN_PROGRESS' as any,
            location: '34.0522,-118.2437',
            userId: citizen.id,
            assignedTo: officer.id,
        },
        {
            id: 'c3',
            title: 'Illegal Dumping in Park',
            description: 'Someone has been dumping trash in the community park.',
            urgency: 'HIGH' as any,
            status: 'PENDING' as any,
            location: '37.7749,-122.4194',
            userId: citizen.id,
            assignedTo: officer2.id,
        },
        {
            id: 'c4',
            title: 'Noise Complaint - Construction',
            description: 'Construction work starting too early in residential area.',
            urgency: 'LOW' as any,
            status: 'RESOLVED' as any,
            location: '41.8781,-87.6298',
            userId: citizen.id,
            assignedTo: officer.id,
        },
        {
            id: 'c5',
            title: 'Water Leak on Oak Avenue',
            description: 'Water main leak causing flooding on the street.',
            urgency: 'HIGH' as any,
            status: 'IN_PROGRESS' as any,
            location: '29.7604,-95.3698',
            userId: citizen.id,
            assignedTo: officer3.id,
        },
        {
            id: 'c6',
            title: 'Graffiti on Public Building',
            description: 'Vandalism on the community center wall.',
            urgency: 'MEDIUM' as any,
            status: 'PENDING' as any,
            location: '33.4484,-112.0740',
            userId: citizen.id,
        },
        {
            id: 'c7',
            title: 'Stray Dog Issue',
            description: 'Multiple stray dogs in the neighborhood causing safety concerns.',
            urgency: 'MEDIUM' as any,
            status: 'PENDING' as any,
            location: '39.7392,-104.9903',
            userId: citizen.id,
        },
        {
            id: 'c8',
            title: 'Broken Traffic Signal',
            description: 'Traffic light at Main and 5th intersection not working.',
            urgency: 'HIGH' as any,
            status: 'IN_PROGRESS' as any,
            location: '47.6062,-122.3321',
            userId: citizen.id,
            assignedTo: officer2.id,
        },
    ];

    for (const complaintData of complaints) {
        await prisma.complaint.create({
            data: complaintData,
        });
    }

    console.log(`✅ Created ${complaints.length} complaints`);

    // Create some timeline entries for complaints
    console.log('📅 Creating complaint timeline entries...');

    await prisma.complaintTimeline.create({
        data: {
            complaintId: 'c2',
            status: 'IN_PROGRESS' as any,
            comment: 'Work crew has been dispatched to fix the pothole.',
            updatedBy: officer.name,
        },
    });

    await prisma.complaintTimeline.create({
        data: {
            complaintId: 'c4',
            status: 'RESOLVED' as any,
            comment: 'Contacted construction company. They will start work at 8 AM instead of 6 AM.',
            updatedBy: officer.name,
        },
    });

    await prisma.complaintTimeline.create({
        data: {
            complaintId: 'c5',
            status: 'IN_PROGRESS' as any,
            comment: 'Water department notified. Repair crew on site.',
            updatedBy: officer3.name,
        },
    });

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Users: ${await prisma.user.count()}`);
    console.log(`   - Complaints: ${await prisma.complaint.count()}`);
    console.log(`   - Timeline Entries: ${await prisma.complaintTimeline.count()}`);
    console.log('');
    console.log('🔑 Test Accounts:');
    console.log('   Citizen:  citizen@test.com  / password');
    console.log('   Officer:  officer@test.com  / password');
    console.log('   Admin:    admin@test.com    / password');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
