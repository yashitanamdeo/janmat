import { PrismaClient, Role, Urgency, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Indian locations for realism
const LOCATIONS = [
    { lat: 28.6139, lng: 77.2090, name: "New Delhi" },
    { lat: 19.0760, lng: 72.8777, name: "Mumbai" },
    { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
    { lat: 13.0827, lng: 80.2707, name: "Chennai" },
    { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
    { lat: 17.3850, lng: 78.4867, name: "Hyderabad" },
    { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
    { lat: 18.5204, lng: 73.8567, name: "Pune" },
    { lat: 26.9124, lng: 75.7873, name: "Jaipur" },
    { lat: 26.8467, lng: 80.9462, name: "Lucknow" }
];

const DEPARTMENTS = [
    "Public Works Department", "Municipal Corporation", "Water Supply Board",
    "Electricity Board", "Traffic Police", "Health Department",
    "Education Department", "Sanitation Department", "Parks & Recreation",
    "Fire Department", "Police Department", "Social Welfare",
    "Housing Board", "Transport Department", "Environment Control",
    "Urban Development", "Rural Development", "Revenue Department",
    "Disaster Management", "Food Safety", "Animal Control",
    "Building Inspection", "Waste Management", "Street Lighting",
    "Road Maintenance", "Sewage Department", "Public Transport",
    "Civil Supplies", "Consumer Affairs", "Labor Department",
    "Women & Child Welfare", "Senior Citizens Welfare", "Youth Affairs",
    "Sports Department", "Tourism Department", "Culture Department",
    "Information Technology", "E-Governance", "Public Relations",
    "Legal Department", "Finance Department", "Audit Department",
    "Planning Department", "Statistics Department", "Archives",
    "Library Services", "Museums", "Heritage Conservation"
];

async function main() {
    console.log('🌱 Starting massive seed generation...');

    const hashedPassword = await bcrypt.hash('password', 10);

    // 1. Create Departments
    console.log('🏢 Creating 48 Departments...');
    const departments = [];
    for (const deptName of DEPARTMENTS) {
        const dept = await prisma.department.create({
            data: {
                name: deptName,
                description: `Responsible for ${deptName.toLowerCase()} related issues and services.`
            }
        });
        departments.push(dept);
    }

    // 2. Create Admin
    console.log('👤 Creating Admin...');
    await prisma.user.create({
        data: {
            name: 'Super Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: Role.ADMIN,
            isVerified: true
        }
    });

    // 3. Create Officers (5 per department = ~240 officers)
    console.log('👮 Creating Officers...');
    const officers = [];
    for (const dept of departments) {
        for (let i = 0; i < 5; i++) {
            const officer = await prisma.user.create({
                data: {
                    name: faker.person.fullName(),
                    email: `officer.${dept.id.substring(0, 4)}.${i}@test.com`,
                    password: hashedPassword,
                    role: Role.OFFICER,
                    departmentId: dept.id,
                    isVerified: true,
                    phone: faker.phone.number(),
                    designation: 'Senior Officer'
                }
            });
            officers.push(officer);
        }
    }
    // Add specific test officer
    const testOfficer = await prisma.user.create({
        data: {
            name: 'Test Officer',
            email: 'officer@test.com',
            password: hashedPassword,
            role: Role.OFFICER,
            departmentId: departments[0].id,
            isVerified: true
        }
    });
    officers.push(testOfficer);

    // 4. Create Citizens (50 citizens)
    console.log('👥 Creating Citizens...');
    const citizens = [];
    for (let i = 0; i < 50; i++) {
        const citizen = await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                email: `citizen${i}@test.com`,
                password: hashedPassword,
                role: Role.CITIZEN,
                isVerified: true,
                phone: faker.phone.number(),
                address: faker.location.streetAddress()
            }
        });
        citizens.push(citizen);
    }
    // Add specific test citizen
    const testCitizen = await prisma.user.create({
        data: {
            name: 'Test Citizen',
            email: 'citizen@test.com',
            password: hashedPassword,
            role: Role.CITIZEN,
            isVerified: true
        }
    });
    citizens.push(testCitizen);

    // 5. Create Complaints (250 complaints)
    console.log('📋 Creating 250+ Complaints...');
    const complaints = [];
    const statuses = Object.values(Status);
    const urgencies = Object.values(Urgency);

    for (let i = 0; i < 250; i++) {
        const citizen = citizens[Math.floor(Math.random() * citizens.length)];
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const deptOfficers = officers.filter(o => o.departmentId === dept.id);
        const officer = deptOfficers.length > 0 ? deptOfficers[Math.floor(Math.random() * deptOfficers.length)] : null;
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

        // Jitter location slightly
        const lat = location.lat + (Math.random() - 0.5) * 0.1;
        const lng = location.lng + (Math.random() - 0.5) * 0.1;

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const createdAt = faker.date.past({ years: 1 });

        const complaint = await prisma.complaint.create({
            data: {
                title: faker.lorem.sentence({ min: 3, max: 6 }),
                description: faker.lorem.paragraph(),
                category: dept.name,
                urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
                status: status,
                location: `${lat},${lng}`,
                latitude: lat,
                longitude: lng,
                userId: citizen.id,
                departmentId: dept.id,
                assignedTo: officer ? officer.id : null,
                createdAt: createdAt,
                resolvedAt: status === 'RESOLVED' ? faker.date.future({ years: 0.1, refDate: createdAt }) : null
            }
        });
        complaints.push(complaint);

        // Add Timeline
        await prisma.complaintTimeline.create({
            data: {
                complaintId: complaint.id,
                status: Status.PENDING,
                comment: 'Complaint registered',
                updatedBy: 'System',
                timestamp: createdAt
            }
        });

        if (status !== 'PENDING' && officer) {
            await prisma.complaintTimeline.create({
                data: {
                    complaintId: complaint.id,
                    status: Status.IN_PROGRESS,
                    comment: 'Officer assigned and investigating',
                    updatedBy: officer.name,
                    timestamp: faker.date.future({ years: 0.01, refDate: createdAt })
                }
            });
        }

        if (status === 'RESOLVED' && officer) {
            await prisma.complaintTimeline.create({
                data: {
                    complaintId: complaint.id,
                    status: Status.RESOLVED,
                    comment: 'Issue resolved successfully',
                    updatedBy: officer.name,
                    timestamp: faker.date.future({ years: 0.05, refDate: createdAt })
                }
            });

            // Add Feedback for resolved complaints
            if (Math.random() > 0.3) {
                await prisma.feedback.create({
                    data: {
                        complaintId: complaint.id,
                        userId: citizen.id,
                        rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
                        comment: faker.lorem.sentence()
                    }
                });
            }
        }
    }

    console.log('✅ Massive seed completed!');
    console.log(`   - ${departments.length} Departments`);
    console.log(`   - ${officers.length} Officers`);
    console.log(`   - ${citizens.length} Citizens`);
    console.log(`   - ${complaints.length} Complaints`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
