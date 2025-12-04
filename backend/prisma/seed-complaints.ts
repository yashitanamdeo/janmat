import { PrismaClient, Urgency, Status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const departments = [
    "Department for Promotion of Industry and Internal Trade (DPIIT)",
    "Department of Administrative Reforms and Public Grievances (DARPG)",
    "Department of Agricultural Research and Education (DARE)",
    "Department of Agriculture and Farmers Welfare (DoAFW)",
    "Department of Animal Husbandry and Dairying (DoAHD)",
    "Department of Biotechnology (DBT)",
    "Department of Border Management (DoBM)",
    "Department of Chemicals and Petro-Chemicals (DoCP)",
    "Department of Commerce (DoC)",
    "Department of Consumer Affairs (DoCA)",
    "Department of Defence (DoD)",
    "Department of Defence Production (DDP)",
    "Department of Defence Research and Development (DRDO)",
    "Department of Drinking Water and Sanitation (DDWS)",
    "Department of Economic Affairs (DEA)",
    "Department of Empowerment of Persons with Disabilities (DEPWD)",
    "Department of Ex-Servicemen Welfare (DESW)",
    "Department of Expenditure (DoE)",
    "Department of Fertilizers (DoFz)",
    "Department of Financial Services (DoFS)",
    "Department of Fisheries (DoF)",
    "Department of Food and Public Distribution (DFPD)",
    "Department of Health Research (DHR)",
    "Department of Health and Family Welfare (DoHFW)",
    "Department of Higher Education (DoHE)",
    "Department of Home (DoH)",
    "Department of Investment and Public Asset Management (DIPAM)",
    "Department of Justice (DoJ)",
    "Department of Land Resources (DLR)",
    "Department of Legal Affairs (DoLA)",
    "Department of Military Affairs (DMA)",
    "Department of Official Language (DoOL)",
    "Department of Pension & Pensioner's Welfare (DoPPW)",
    "Department of Personnel and Training (DoPT)",
    "Department of Pharmaceuticals (DoPs)",
    "Department of Posts (DoP)",
    "Department of Public Enterprises (DPE)",
    "Department of Revenue (DoR)",
    "Department of Rural Development (DoRD)",
    "Department of School Education and Literacy (DSEL)",
    "Department of Science and Technology (DST)",
    "Department of Scientific and Industrial Research (DSIR)",
    "Department of Social Justice and Empowerment (DoSJE)",
    "Department of Sports (DoS)",
    "Department of Telecommunications (DoT)",
    "Department of Water Resources, River Development and Ganga Rejuvenation (DoWRGR)",
    "Department of Youth Affairs (DoYA)",
    "Legislative Department (LD)"
];

const complaintTemplates = [
    { title: "Delay in Service", desc: "The service requested has been delayed significantly beyond the promised timeline." },
    { title: "Staff Misconduct", desc: "The staff member was rude and unhelpful during the interaction." },
    { title: "Website Glitch", desc: "Unable to access the online portal for submitting documents." },
    { title: "Infrastructure Issue", desc: "The office premises are in poor condition and need maintenance." },
    { title: "Corruption Allegation", desc: "Demand for bribe was made for processing the application." },
    { title: "Policy Clarification", desc: "Need clarification regarding the new policy guidelines issued." }
];

async function main() {
    console.log('Start seeding complaints...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create/Get Citizen User
    const citizen = await prisma.user.upsert({
        where: { email: 'citizen@janmat.com' },
        update: {},
        create: {
            name: 'Rahul Sharma',
            email: 'citizen@janmat.com',
            password: hashedPassword,
            role: 'CITIZEN',
            phone: '9876543210',
            isVerified: true
        }
    });

    console.log(`Created citizen: ${citizen.name}`);

    // 2. Create Departments & Complaints
    for (const deptName of departments) {
        const dept = await prisma.department.upsert({
            where: { name: deptName },
            update: {},
            create: { name: deptName }
        });

        console.log(`Processed Department: ${dept.name}`);

        // Create 3-5 complaints per department
        const numComplaints = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < numComplaints; i++) {
            const template = complaintTemplates[Math.floor(Math.random() * complaintTemplates.length)];
            const status = Math.random() > 0.7 ? 'RESOLVED' : (Math.random() > 0.4 ? 'IN_PROGRESS' : 'PENDING');
            const urgency = Math.random() > 0.8 ? 'HIGH' : (Math.random() > 0.5 ? 'MEDIUM' : 'LOW');

            // Generate random date in last 30 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));

            await prisma.complaint.create({
                data: {
                    title: `${template.title} - ${dept.name.split('(')[0].trim().substring(0, 20)}...`,
                    description: `${template.desc} This is affecting our work with ${dept.name}. Please resolve ASAP.`,
                    userId: citizen.id,
                    departmentId: dept.id,
                    status: status as Status,
                    urgency: urgency as Urgency,
                    location: 'New Delhi, India',
                    createdAt: date,
                    resolvedAt: status === 'RESOLVED' ? new Date() : null
                }
            });
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
