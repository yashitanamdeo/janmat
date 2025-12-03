import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const departments = [
    {
        id: "7d637cfa-4e53-4ba7-9b5e-3890aa17b97c",
        name: "Department for Promotion of Industry and Internal Trade (DPIIT)",
        description: "The Department for Promotion of Industry and Internal Trade (DPIIT) is a government agency under India's Ministry of Commerce and Industry responsible for developing and implementing policies to promote industrial growth, facilitate foreign direct investment, and enhance internal trade. Its mission is to foster a conducive environment for businesses through investor-friendly policies, promoting ease of doing business, protecting intellectual property, and supporting startups and e-commerce to achieve inclusive economic growth."
    },
    {
        id: "d666f489-86f1-4323-a05f-5f0c884b35b2",
        name: "Department of Administrative Reforms and Public Grievances (DARPG)",
        description: "DARPG stands for the Department of Administrative Reforms and Public Grievances, which is the nodal agency of the Government of India responsible for improving administrative efficiency and handling public grievances. Its key functions include formulating policies for citizen-centric governance, documenting good governance practices, and coordinating the redressal of public grievances through systems like CPGRAMS (Centralized Public Grievance Redress and Monitoring System)."
    },
    {
        id: "f7decbb3-bd3a-4fc8-827b-fe26fd3847ad",
        name: "Department of Agricultural Research and Education (DARE)",
        description: "The Department of Agricultural Research and Education (DARE) is a government body in India that coordinates and promotes agricultural research and education across the country. It acts as the administrative link between the government and the Indian Council of Agricultural Research (ICAR), which is the apex organization for guiding agricultural research and education in fields like horticulture, fisheries, and animal sciences."
    },
    {
        id: "48fd1dec-2757-436f-a4d1-488efc4cec13",
        name: "Department of Agriculture and Farmers Welfare (DoAFW)",
        description: "The Department of Agriculture and Farmers Welfare (DA&FW) is a key branch of the Indian government's Ministry of Agriculture and Farmers Welfare, responsible for overseeing and implementing policies that aim to enhance agricultural productivity and ensure the welfare of farmers. Its mission is to boost farm production and sustainability through various schemes and programs, while also ensuring farmers have better livelihoods and market access."
    },
    {
        id: "0f71f891-48a3-47ca-94d7-4fd5eb0975d8",
        name: "Department of Animal Husbandry and Dairying (DoAHD)",
        description: "The Department of Animal Husbandry and Dairying (DAHD) is a government department responsible for the development of the animal husbandry and dairy sectors in India. Its meaning encompasses policies and programs for improving livestock health, enhancing productivity, developing dairy infrastructure, and promoting sustainable livestock growth for economic prosperity and livelihood support."
    },
    {
        id: "a7e1c04d-9ce2-46f1-a202-fa6035d7c51c",
        name: "Department of Biotechnology (DBT)",
        description: "The \"Department of Biotechnology\" generally refers to a government or academic body that promotes and manages research, development, and commercialization in the field of biotechnology. In India, the Department of Biotechnology (DBT) is a government agency under the Ministry of Science and Technology that is responsible for the development and commercialization of biotechnology across various sectors like agriculture, healthcare, and environment."
    },
    {
        id: "462ff906-74e3-4250-8b8e-e63613d019d0",
        name: "Department of Border Management (DoBM)",
        description: "The Department of Border Management is a government division, such as the one within India's Ministry of Home Affairs, responsible for securing international borders, managing both land and coastal frontiers, and overseeing border area development. Its duties include strengthening border security, building related infrastructure like fences and roads, and facilitating legal trade and movement of people while preventing illegal activities like smuggling and infiltration. The department works with other agencies to implement integrated strategies that balance national security with economic development in border regions."
    },
    {
        id: "62bc2c4b-3a40-4487-9b32-465c904da697",
        name: "Department of Chemicals and Petro-Chemicals (DoCP)",
        description: "The Department of Chemicals and Petrochemicals (DCPC) is a government agency in India responsible for policy, planning, development, and regulation of the country's chemical and petrochemical sectors. It operates under the Ministry of Chemicals and Fertilizers and its work includes promoting growth, fostering public-private partnerships, and overseeing related public sector undertakings and institutes."
    },
    {
        id: "205393c3-1096-4132-aca5-d6edc8a757aa",
        name: "Department of Commerce (DoC)",
        description: "A department of commerce is a government agency responsible for managing and promoting a country's domestic and foreign trade. It formulates and implements trade policies, manages trade relations with other nations, and works to boost exports by creating a supportive environment for trade and industry. Key functions include export promotion, trade facilitation, and regulating export-oriented industries and commodities."
    },
    {
        id: "7f022a28-b116-4f47-9ee7-8a12be0a9e30",
        name: "Department of Consumer Affairs (DoCA)",
        description: "The Department of Consumer Affairs (DCA) is a government department, such as the one in India, that focuses on protecting and advocating for consumer rights. Its purpose is to ensure consumers can make informed choices, receive fair treatment, and have their grievances addressed in a timely manner. This is achieved through the administration of laws, monitoring of essential commodity prices and availability, and promoting consumer awareness. "
    },
    {
        id: "35c8c47e-bc79-4cb8-a3fc-69c1479baff2",
        name: "Department of Defence (DoD)",
        description: "A Department of Defense is a government agency responsible for the military and national security, headed by a civilian secretary. For example, the U.S. Department of Defense is a major executive department responsible for providing military forces to deter war and protect national security, and it is headquartered in the Pentagon. Other countries, like India and Australia, also have their own departments of defense with similar responsibilities, such as managing their military forces and handling defense cooperation."
    },
    {
        id: "263e7176-1f66-4c60-b2b2-11d8489ca09c",
        name: "Department of Defence Production (DDP)",
        description: "The Department of Defence Production (DDP) is a government department responsible for overseeing defence manufacturing and achieving self-reliance in defence equipment. It manages a network of Defence Public Sector Undertakings (DPSUs) and private companies to ensure the design, development, and production of weapons, systems, and platforms for a country's armed forces. The DDP's role includes indigenization of imported parts and planning and controlling production units, with a key objective of making defence equipment indigenously."
    },
    {
        id: "4b32b0b8-4113-4003-8543-dd9decf42c8f",
        name: "Department of Defence Research and Development (DRDO)",
        description: "The Department of Defence Research and Development (DDR&D) is the government department responsible for the research and development of defense technologies, systems, and equipment. In India, this function is primarily carried out by the Defence Research and Development Organisation (DRDO), which works to ensure the country has cutting-edge technology and is self-reliant in critical defense systems, equipping the armed forces with advanced weapon systems and equipment."
    },
    {
        id: "45284cc2-18b1-4611-9bb6-acfcd513aed9",
        name: "Department of Drinking Water and Sanitation (DDWS)",
        description: "The Department of Drinking Water and Sanitation (DDWS) (now part of the Ministry of Jal Shakti) is the Indian government body responsible for policy, planning, and coordination of programs for safe drinking water and sanitation, primarily in rural areas. Its meaning is to ensure rural households have access to safe drinking water and improved sanitation facilities through national missions like the Jal Jeevan Mission and the Swachh Bharat Mission."
    },
    {
        id: "cec88d24-8557-439f-9ab7-28006c6f22bb",
        name: "Department of Economic Affairs (DEA)",
        description: "The Department of Economic Affairs (DEA) is the Union government's nodal agency for formulating and monitoring economic policies and programs, playing a central role in managing a nation's economy. Its key functions include presenting the Union Budget, managing fiscal policy, overseeing capital and financial markets, coordinating with international financial institutions, and handling matters like currency and stamp production. The DEA's work is crucial for ensuring economic stability, promoting growth, and managing financial resources for the country."
    },
    {
        id: "6c6bc9ae-d85b-4d73-9f3a-366f7b8a54ac",
        name: "Department of Empowerment of Persons with Disabilities (DEPWD)",
        description: "The Department of Empowerment of Persons with Disabilities (DEPwD) is a government body in India under the Ministry of Social Justice & Empowerment that serves as the nodal agency for all matters related to persons with disabilities (Divyangjan). Its meaning is to facilitate the empowerment and inclusion of people with disabilities by developing policies, implementing programs, and coordinating with various stakeholders to ensure equal opportunities, rehabilitation, and social integration."
    },
    {
        id: "d5381544-ec70-4952-80d7-d7ca2bc1bed8",
        name: "Department of Ex-Servicemen Welfare (DESW)",
        description: "The Department of Ex-Servicemen Welfare (DESW) is a government department under India's Ministry of Defence responsible for the welfare, resettlement, and healthcare of retired Indian Armed Forces personnel and their families. It formulates and implements policies related to pension, healthcare (like through the Ex-Servicemen Contributory Health Scheme), and to ensure their successful transition to civilian life. The department's goal is to support ex-servicemen and their dependents with various benefits and programs."
    },
    {
        id: "36338abb-6e31-4bbd-965f-55aca37f947f",
        name: "Department of Expenditure (DoE)",
        description: "The Department of Expenditure is the central government body in India responsible for public financial management, overseeing government spending to ensure it is optimized and efficient. It manages government accounts, implements recommendations from the Finance Commission and Central Pay Commission, and provides guidance to ministries and departments to control costs and improve the outcomes of public expenditure."
    },
    {
        id: "7c263eeb-abb6-4023-9acf-b4f4df243008",
        name: "Department of Fertilizers (DoFz)",
        description: "The Department of Fertilizers is a government agency within the Ministry of Chemicals & Fertilizers that focuses on planning, developing, and monitoring the fertilizer industry to ensure the adequate, timely, and affordable availability of fertilizers for agriculture. Its functions include managing production, import, and distribution, and administering government subsidies and concessions. The department's goal is to maximize agricultural output by ensuring farmers have access to the fertilizers they need."
    },
    {
        id: "e33f07c5-ddcf-403a-b23e-3426b28bddf3",
        name: "Department of Financial Services (DoFS)",
        description: "The Department of Financial Services (DFS) is a government body under India's Ministry of Finance that formulates policy, monitors performance, and administers laws for the country's financial sector, including banking, insurance, and pensions. Its key functions involve creating policies for public sector banks and insurance companies, overseeing their performance, and handling various grievances and schemes related to financial institutions."
    },
    {
        id: "836edbd4-9e5b-4699-ad34-78e3bea64e9d",
        name: "Department of Fisheries (DoF)",
        description: "A fisheries department is a government agency responsible for managing and regulating fishing, aquaculture, and related activities. Its duties include formulating policies, promoting the sustainable development of fisheries, conserving aquatic resources, and ensuring the socio-economic well-being of fishermen and fish farmers. These departments can operate at the national, state, or local level and are sometimes housed within ministries like agriculture or animal husbandry."
    },
    {
        id: "e277ac49-76f2-43f6-8c30-1ce6f1f4a7ca",
        name: "Department of Food and Public Distribution (DFPD)",
        description: "The Department of Food and Public Distribution (DFPD) is a department under the Indian Ministry of Consumer Affairs, Food & Public Distribution responsible for ensuring the food security of citizens. Its main functions include formulating national policies for food grain procurement, storage, and distribution, as well as implementing the Public Distribution System (PDS) to provide subsidized food grains like rice, wheat, and sugar to the poor through a network of fair price shops. "
    },
    {
        id: "112bdcc1-603f-4757-aa81-339c95457fbc",
        name: "Department of Health Research (DHR)",
        description: "The Department of Health Research (DHR) is a government agency in India that promotes, coordinates, and translates medical and health research into public health action. Established in 2007 under the Ministry of Health & Family Welfare, its key functions include financing research, strengthening infrastructure, and developing policies and skilled personnel to improve public health outcomes through modern health technologies, diagnostics, and treatment methods."
    },
    {
        id: "5249d17d-4ae2-4563-9f9a-f114a7ec2e82",
        name: "Department of Health and Family Welfare (DoHFW)",
        description: "The Department of Health and Family Welfare (DHFW) is a government department responsible for maintaining and developing the healthcare system through policy formulation, program implementation, and public health services like preventive, promotive, and curative care. It focuses on ensuring the health and well-being of all citizens, with a specific emphasis on vulnerable groups, reproductive and maternal health, child health, and the prevention and control of diseases."
    },
    {
        id: "5b535fc2-4c23-4dd6-8167-50325676e27c",
        name: "Department of Higher Education (DoHE)",
        description: "A higher education department is a government body responsible for overseeing universities, colleges, and other post-secondary institutions. Its role includes setting policy, planning development, ensuring quality, and managing the administrative and academic aspects of higher learning to support the social, economic, and scientific advancement of a nation."
    },
    {
        id: "4e701d5d-22ae-4454-a839-79c426d7b460",
        name: "Department of Home (DoH)",
        description: "A home department is a government agency responsible for a country or state's internal security, public safety, and law enforcement, implementing policies for internal and external security and overseeing areas like policing, border management, immigration, and disaster management. It is the equivalent of an interior ministry in many countries."
    },
    {
        id: "7fb7a9fa-eefe-4c55-b1c1-7087dc9f3a47",
        name: "Department of Investment and Public Asset Management (DIPAM)",
        description: "The Department of Investment and Public Asset Management (DIPAM) is a government body under India's Ministry of Finance that manages the central government's equity investments in public sector companies, handles their disinvestment, and makes decisions on selling government shares. It was previously known as the Department of Disinvestment and was renamed to reflect its expanded mandate of both investment and public asset management."
    },
    {
        id: "f0cabf22-5a98-40fe-88f8-9e7ab7bc50cf",
        name: "Department of Justice (DoJ)",
        description: "The Department of Justice is a governmental body responsible for facilitating the administration of justice and ensuring its timely delivery. Its functions include appointing judges to high courts and the Supreme Court, modernizing court procedures, and implementing policies for judicial reform, such as setting up special courts and providing legal aid. The department's mission is to ensure easy access to and a fair delivery of justice for all."
    },
    {
        id: "f9532733-4a9b-4c0c-888c-299988b4ecad",
        name: "Department of Land Resources (DLR)",
        description: "The Department of Land Resources (DoLR) is a government agency in India under the Ministry of Rural Development that is responsible for modernizing land records, managing land acquisition, and implementing programs to improve the productivity of degraded lands. Its main functions include supporting states in digitizing land records through programs like the Digital India Land Records Modernization Programme (DLRMP), administering laws related to land acquisition and compensation, and implementing watershed management projects to improve rural livelihoods."
    },
    {
        id: "8eb6c8db-17e1-4c17-9397-c324eef02255",
        name: "Department of Legal Affairs (DoLA)",
        description: "A Department of Legal Affairs is a government agency that provides legal counsel, drafts legislation, and handles legal cases for the government and its ministries. Its primary duties include advising on legal matters, interpreting laws, and representing the government in court, which involves both litigation and non-litigation work."
    },
    {
        id: "97838eea-05d0-43e3-8c21-65f4fe089fa4",
        name: "Department of Military Affairs (DMA)",
        description: "The Department of Military Affairs (DMA) is a department of the Indian Ministry of Defence that manages the armed forces, including the Army, Navy, and Air Force. It was created to promote jointness and optimize resource utilization among the three services and is headed by the Chief of Defence Staff (CDS) in their role as ex-officio Secretary. The DMA handles matters related to the armed forces, the Integrated Headquarters of the Ministry of Defence, and the Territorial Army.  "
    },
    {
        id: "15fba4f6-80cf-4d31-b8b6-6cfa387ae926",
        name: "Department of Official Language (DoOL)",
        description: "The Department of Official Language is an Indian government department within the Ministry of Home Affairs responsible for promoting and implementing the use of Hindi for the official purposes of the Union government. It ensures compliance with constitutional and legal provisions, coordinates the progressive use of Hindi alongside English, and handles the translation of official documents."
    },
    {
        id: "4738b595-3f1c-44b3-a6de-69358de5a57b",
        name: "Department of Pension & Pensioner's Welfare (DoPPW)",
        description: "The Department of Pension & Pensioner's Welfare is the nodal agency in India's central government responsible for formulating and implementing policies related to pension and retirement benefits for central government employees. Its primary purpose is to ensure the timely and smooth payment of pensions and promote pensioners' welfare through grievance redressal, policy simplification, and other support measures."
    },
    {
        id: "bde1ed9b-e84b-4b1b-87a0-0e720a83d010",
        name: "Department of Personnel and Training (DoPT)",
        description: "The Department of Personnel and Training (DOPT) is the nodal agency of the Government of India responsible for personnel matters, such as recruitment, training, and career development for central government employees."
    },
    {
        id: "09a12546-737b-4a37-8bd8-2b29856597d9",
        name: "Department of Pharmaceuticals (DoPs)",
        description: "The Department of Pharmaceuticals is a government agency under the Ministry of Chemicals and Fertilizers in India that focuses on the growth and regulation of the pharmaceutical sector. Its meaning involves ensuring the availability and affordability of medicines, promoting research and development, and overseeing policies related to drug pricing, intellectual property rights, and international commitments."
    },
    {
        id: "0ad8d861-43e0-493b-a953-660acb89cc87",
        name: "Department of Posts (DoP)",
        description: "The \"department of post\" refers to the government agency responsible for postal services, including the collection, transmission, and delivery of mail and parcels. It also provides other services like small savings schemes, postal life insurance, and retail services such as bill payment and sale of forms. For example, in India, the Department of Posts is a government organization with the world's largest postal network, providing these varied services to citizens."
    },
    {
        id: "406913db-fac0-482f-9a0a-682883f53b13",
        name: "Department of Public Enterprises (DPE)",
        description: "The Department of Public Enterprises (DPE) is a government department responsible for formulating policies and coordinating with Central Public Sector Enterprises (CPSEs). It functions as the nodal department for these enterprises, which are companies where the government holds a majority stake. The DPE's roles include performance evaluation, employee management, and advising on restructuring or revival."
    },
    {
        id: "1ee62ddb-aeca-45eb-86b8-092baa534870",
        name: "Department of Revenue (DoR)",
        description: "A Department of Revenue is a government agency responsible for managing a nation's or state's finances, primarily by collecting taxes, enforcing revenue laws, and administering related programs. This includes levying and collecting both direct (like income tax) and indirect taxes (like GST), investigating economic offenses, and ensuring compliance with financial regulations. "
    },
    {
        id: "a9dee4a5-e6dd-4e33-b29f-4f5e459a9468",
        name: "Department of Rural Development (DoRD)",
        description: "A Department of Rural Development is a government agency responsible for improving the socio-economic well-being of people in rural areas. Its functions typically include implementing anti-poverty programs, managing infrastructure projects like rural roads, and providing grants for housing, health, and education to improve the quality of life in non-urban areas."
    },
    {
        id: "4dd9e557-34c5-4c46-90c6-e649a89ffb4e",
        name: "Department of School Education and Literacy (DSEL)",
        description: "The Department of School Education and Literacy (DoSEL) is a government body responsible for the development of primary, secondary, and adult education, as well as promoting literacy throughout a country. Its main functions include formulating and implementing national education policies, expanding access to and improving the quality of education, and ensuring equitable opportunities for all students, including those from disadvantaged groups."
    },
    {
        id: "b34ea41f-32e2-44a7-95b8-2b5021120add",
        name: "Department of Science and Technology (DST)",
        description: "The Department of Science and Technology (DST) is a government agency responsible for promoting, organizing, and coordinating scientific and technological activities within a country. Its main function is to act as a nodal department to foster research and development, formulate science and technology policies, and support new and emerging areas of science and technology. It supports students, scientists, and institutions through grants, fellowships, and R&D projects to advance scientific and technological progress and its application for socio-economic development."
    },
    {
        id: "155f24de-83b4-458f-bf5d-a43150e7be39",
        name: "Department of Scientific and Industrial Research (DSIR)",
        description: "The Department of Scientific and Industrial Research (DSIR) is a government agency in India that promotes industrial research, development, and technology transfer. As a part of the Ministry of Science and Technology, its mandate includes supporting R&D in industries, helping small and medium-sized businesses develop competitive technologies, and commercializing lab-scale research."
    },
    {
        id: "19ce6d41-61c9-4146-8452-b33769d52188",
        name: "Department of Social Justice and Empowerment (DoSJE) ",
        description: "The Department of Social Justice and Empowerment is a government body that aims to empower marginalized and disadvantaged groups in society through educational, social, and economic development programs. Its meaning is centered on creating an inclusive society where vulnerable populations, such as Scheduled Castes, Other Backward Classes, senior citizens, and victims of substance abuse, are supported to achieve self-reliance and live with dignity. The Department is responsible for creating and implementing national legislation, policies, and programs to support these groups and oversee their implementation. "
    },
    {
        id: "3806f5ae-ac52-4e67-8bd5-0f5c07b8f37e",
        name: "Department of Sports (DoS)",
        description: "A Department of Sports is a government agency responsible for promoting and developing sports, which includes creating sports infrastructure, funding athletic activities, and supporting athletes to achieve excellence. It works to improve sports facilities, build capacity in athletes and coaches, and organize both national and international sporting events."
    },
    {
        id: "39bbc38a-b704-4bdc-bc04-f22cb10f9ba0",
        name: "Department of Telecommunications (DoT)",
        description: "The Department of Telecommunications (DoT) is a government agency in India that operates under the Ministry of Communications and is responsible for policy, licensing, and coordination of all telecommunications services. Its duties include formulating development policies, issuing licenses for services like the internet and mobile, managing radio frequency spectrum, and coordinating with international bodies on telecom matters."
    },
    {
        id: "ee3ea409-e90d-4a7c-aa53-37945e6d2b00",
        name: "Department of Water Resources, River Development and Ganga Rejuvenation (DoWRGR)",
        description: "The \"Department of Water Resources, River Development and Ganga Rejuvenation\" (now part of the Ministry of Jal Shakti) is the government department in India responsible for managing the nation's water resources, including the rejuvenation of the Ganges River. Its meaning is to oversee and administer policies and projects for flood control, irrigation, drinking water, and power development, with a specific focus on cleaning and restoring the Ganga river through the Namami Gange Programme. "
    },
    {
        id: "cec907d1-2640-4573-bb8e-4cefdc798216",
        name: "Department of Youth Affairs (DoYA)",
        description: "The Department of Youth Affairs is a government department focused on the development and empowerment of young people, typically aged 15-29, by fostering their personality and involving them in nation-building activities. It aims to act as a facilitator, coordinating with other ministries and state governments to implement policies and programs that benefit youth in areas like education, employment, and health."
    },
    {
        id: "0a7ca51e-a79e-4da0-ae17-244bb9223196",
        name: "Legislative Department (LD)",
        description: "A legislative department is a government body, or part of the government, responsible for drafting and creating laws (legislation). It can also refer to a specific government department, like the Legislative Department in India, which drafts bills, issues ordinances and regulations, and manages election laws. "
    }
];

async function restoreDepartments() {
    console.log('🏢 Restoring ALL 47 departments with exact IDs...\n');

    let createdCount = 0;
    let skippedCount = 0;

    for (const dept of departments) {
        try {
            await prisma.department.upsert({
                where: { id: dept.id },
                update: {
                    name: dept.name,
                    description: dept.description
                },
                create: {
                    id: dept.id,
                    name: dept.name,
                    description: dept.description
                }
            });
            console.log(`   ✅ Restored: ${dept.name}`);
            createdCount++;
        } catch (error: any) {
            console.error(`   ❌ Error restoring ${dept.name}:`, error.message);
            skippedCount++;
        }
    }

    console.log(`\n✨ Department restoration complete!`);
    console.log(`📊 Departments restored: ${createdCount}`);
    console.log(`⚠️  Departments skipped: ${skippedCount}`);
    console.log(`📋 Total departments: ${departments.length}`);
    console.log('');
}

restoreDepartments()
    .catch((error) => {
        console.error('❌ Error during restoration:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
