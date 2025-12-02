import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const officerFirstNames = [
    'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Deepika',
    'Arjun', 'Kavita', 'Suresh', 'Meera', 'Karan', 'Pooja', 'Sanjay', 'Nisha',
    'Aditya', 'Ritu', 'Manoj', 'Swati', 'Vishal', 'Preeti', 'Nitin', 'Anita',
    'Ashok', 'Sunita', 'Ravi', 'Geeta', 'Prakash', 'Lakshmi', 'Dinesh', 'Rekha',
    'Mohit', 'Shweta', 'Ramesh', 'Seema', 'Ajay', 'Vandana', 'Sandeep', 'Madhuri',
    'Gaurav', 'Neha', 'Pankaj', 'Asha', 'Naveen', 'Shalini', 'Rohit', 'Divya',
    'Sachin', 'Jyoti', 'Manish', 'Sapna', 'Alok', 'Renu', 'Vivek', 'Pallavi',
    'Anand', 'Kiran', 'Sunil', 'Usha', 'Harish', 'Radha', 'Yogesh', 'Manju',
    'Anil', 'Lata', 'Praveen', 'Suman', 'Bharat', 'Kamala', 'Chetan', 'Savita',
    'Deepak', 'Poonam', 'Gopal', 'Shanti', 'Hemant', 'Vidya', 'Jagdish', 'Pushpa',
    'Kishore', 'Archana', 'Lalit', 'Bharti', 'Mukesh', 'Chhaya', 'Naresh', 'Durga',
    'Pawan', 'Gayatri', 'Rajeev', 'Hemlata', 'Satish', 'Indira', 'Shyam', 'Janaki',
    'Tarun', 'Kalyani', 'Umesh', 'Leela', 'Vinod', 'Malini', 'Yash', 'Nalini'
];

const officerLastNames = [
    'Kumar', 'Singh', 'Sharma', 'Verma', 'Patel', 'Gupta', 'Reddy', 'Nair',
    'Rao', 'Iyer', 'Joshi', 'Desai', 'Mehta', 'Shah', 'Agarwal', 'Bansal',
    'Chopra', 'Das', 'Ghosh', 'Malhotra', 'Kapoor', 'Khanna', 'Bhat', 'Menon',
    'Pillai', 'Shetty', 'Kulkarni', 'Deshpande', 'Jain', 'Saxena', 'Mishra', 'Pandey',
    'Tiwari', 'Dubey', 'Tripathi', 'Srivastava', 'Chaudhary', 'Yadav', 'Thakur', 'Rathore'
];

async function seedOfficers() {
    console.log('🌱 Starting officer seeding...\n');

    try {
        // Get all departments
        const departments = await prisma.department.findMany({
            select: { id: true, name: true }
        });

        console.log(`📋 Found ${departments.length} departments\n`);

        if (departments.length === 0) {
            console.log('❌ No departments found. Please run the department seed first.');
            return;
        }

        const hashedPassword = await bcrypt.hash('Officer@123', 10);
        let totalOfficersCreated = 0;
        let usedCombinations = new Set<string>();

        for (const department of departments) {
            console.log(`👮 Creating officers for: ${department.name}`);

            // Create 2-3 officers per department
            const officerCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 officers

            for (let i = 0; i < officerCount; i++) {
                // Generate unique name combination
                let firstName, lastName, fullName;
                let attempts = 0;

                do {
                    firstName = officerFirstNames[Math.floor(Math.random() * officerFirstNames.length)];
                    lastName = officerLastNames[Math.floor(Math.random() * officerLastNames.length)];
                    fullName = `${firstName} ${lastName}`;
                    attempts++;

                    if (attempts > 50) {
                        // If we can't find a unique combination, add a number
                        fullName = `${firstName} ${lastName} ${Math.floor(Math.random() * 1000)}`;
                        break;
                    }
                } while (usedCombinations.has(fullName));

                usedCombinations.add(fullName);

                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}@janmat.gov.in`;
                const phone = `${9000000000 + totalOfficersCreated}`;

                try {
                    await prisma.user.create({
                        data: {
                            name: fullName,
                            email,
                            phone,
                            password: hashedPassword,
                            role: 'OFFICER',
                            departmentId: department.id,
                            isVerified: true,
                        },
                    });

                    totalOfficersCreated++;
                    console.log(`   ✅ Created: ${fullName} (${email})`);
                } catch (error: any) {
                    if (error.code === 'P2002') {
                        console.log(`   ⚠️  Skipped: ${fullName} (already exists)`);
                    } else {
                        console.error(`   ❌ Error creating ${fullName}:`, error.message);
                    }
                }
            }

            console.log('');
        }

        console.log(`\n✨ Seeding complete!`);
        console.log(`📊 Total officers created: ${totalOfficersCreated}`);
        console.log(`🏢 Departments populated: ${departments.length}`);
        console.log(`\n🔑 Default password for all officers: Officer@123\n`);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedOfficers()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
