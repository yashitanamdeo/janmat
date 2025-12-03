import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDepartments() {
    console.log('🏢 Creating departments...\n');

    const departments = [
        {
            name: 'Public Works',
            description: 'Handles infrastructure, roads, and public facilities maintenance'
        },
        {
            name: 'Sanitation',
            description: 'Manages waste collection, street cleaning, and sanitation services'
        },
        {
            name: 'Water Supply',
            description: 'Oversees water distribution, quality, and pipeline maintenance'
        },
        {
            name: 'Electricity',
            description: 'Manages power supply, street lights, and electrical infrastructure'
        },
        {
            name: 'Traffic & Transport',
            description: 'Handles traffic management, signals, and public transportation'
        },
        {
            name: 'Health & Safety',
            description: 'Manages public health, safety inspections, and emergency services'
        },
        {
            name: 'Parks & Recreation',
            description: 'Maintains parks, gardens, and recreational facilities'
        },
        {
            name: 'Building & Planning',
            description: 'Oversees construction permits, urban planning, and building regulations'
        },
        {
            name: 'Environment',
            description: 'Handles environmental protection, pollution control, and green initiatives'
        },
        {
            name: 'Animal Control',
            description: 'Manages stray animals, pet licensing, and animal welfare'
        }
    ];

    let createdCount = 0;

    for (const dept of departments) {
        try {
            await prisma.department.create({
                data: dept
            });
            console.log(`   ✅ Created: ${dept.name}`);
            createdCount++;
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.log(`   ⚠️  Already exists: ${dept.name}`);
            } else {
                console.error(`   ❌ Error creating ${dept.name}:`, error.message);
            }
        }
    }

    console.log(`\n✨ Department seeding complete!`);
    console.log(`📊 Departments created: ${createdCount}`);
    console.log('');
}

seedDepartments()
    .catch((error) => {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
