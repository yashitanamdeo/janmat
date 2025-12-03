import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import prisma from '../config/db';

export class AdminController {
    static getDashboardStats = catchAsync(async (req: Request, res: Response) => {
        const totalComplaints = await prisma.complaint.count();
        const pendingComplaints = await prisma.complaint.count({ where: { status: 'PENDING' } });
        const inProgressComplaints = await prisma.complaint.count({ where: { status: 'IN_PROGRESS' } });
        const resolvedComplaints = await prisma.complaint.count({ where: { status: 'RESOLVED' } });
        const totalUsers = await prisma.user.count();
        const totalOfficers = await prisma.user.count({ where: { role: 'OFFICER' } });

        res.json({
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            resolvedComplaints,
            totalUsers,
            totalOfficers,
        });
    });

    static getAllComplaints = catchAsync(async (req: Request, res: Response) => {
        const complaints = await prisma.complaint.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                attachments: true,
                department: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(complaints);
    });

    static getOfficers = catchAsync(async (req: Request, res: Response) => {
        const officers = await prisma.user.findMany({
            where: { role: 'OFFICER' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                departmentId: true,
                department: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                assignedComplaints: {
                    select: {
                        status: true
                    }
                }
            },
        });

        // Transform to include counts
        const officersWithCounts = officers.map(officer => ({
            ...officer,
            _count: {
                assignedComplaints: officer.assignedComplaints.length,
                resolvedComplaints: officer.assignedComplaints.filter(c => c.status === 'RESOLVED').length
            },
            assignedComplaints: undefined
        }));

        res.json(officersWithCounts);
    });

    static assignComplaint = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { officerId } = req.body;

        // Fetch officer to get department
        const officer = await prisma.user.findUnique({
            where: { id: officerId },
            select: { id: true, departmentId: true, name: true }
        });

        if (!officer) {
            throw new Error('Officer not found');
        }

        const complaint = await prisma.complaint.update({
            where: { id },
            data: {
                assignedTo: officerId,
                departmentId: officer.departmentId, // Auto-assign department
                status: 'IN_PROGRESS',
            },
            include: {
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Send notification to officer
        await prisma.notification.create({
            data: {
                userId: officerId,
                title: 'New Complaint Assigned',
                message: `You have been assigned: ${complaint.title}`,
                type: 'ASSIGNMENT'
            }
        });

        res.json(complaint);
    });

    static assignComplaintAlt = catchAsync(async (req: Request, res: Response) => {
        const { complaintId, officerId } = req.body;

        // Fetch officer to get department
        const officer = await prisma.user.findUnique({
            where: { id: officerId },
            select: { id: true, departmentId: true, name: true }
        });

        if (!officer) {
            throw new Error('Officer not found');
        }

        const complaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                assignedTo: officerId,
                departmentId: officer.departmentId, // Auto-assign department
                status: 'IN_PROGRESS',
            },
            include: {
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Send notification
        await prisma.notification.create({
            data: {
                userId: officerId,
                message: `New complaint assigned: ${complaint.title}`,
                type: 'INFO'
            }
        });

        res.json(complaint);
    });

    static downloadReport = catchAsync(async (req: Request, res: Response) => {
        const { format } = req.query;

        const complaints = await prisma.complaint.findMany({
            include: {
                user: true,
                assignedOfficer: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (format === 'pdf') {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ margin: 50 });

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=complaints-report.pdf');

            // Pipe PDF to response
            doc.pipe(res);

            // Add header
            doc.fontSize(20).text('JanMat Complaints Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();

            // Add statistics
            const stats = {
                total: complaints.length,
                pending: complaints.filter(c => c.status === 'PENDING').length,
                inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
                resolved: complaints.filter(c => c.status === 'RESOLVED').length,
                rejected: complaints.filter(c => c.status === 'REJECTED').length,
            };

            doc.fontSize(14).text('Summary Statistics', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(10);
            doc.text(`Total Complaints: ${stats.total}`);
            doc.text(`Pending: ${stats.pending}`);
            doc.text(`In Progress: ${stats.inProgress}`);
            doc.text(`Resolved: ${stats.resolved}`);
            doc.text(`Rejected: ${stats.rejected}`);
            doc.moveDown();

            // Add complaints table
            doc.fontSize(14).text('Complaint Details', { underline: true });
            doc.moveDown(0.5);

            complaints.forEach((complaint, index) => {
                if (index > 0) doc.moveDown(0.5);

                doc.fontSize(10);
                doc.fillColor('#000000');
                doc.text(`${index + 1}. ${complaint.title}`, { continued: false });
                doc.fontSize(9);
                doc.fillColor('#444444');
                doc.text(`   Status: ${complaint.status} | Urgency: ${complaint.urgency}`);
                doc.text(`   Assigned To: ${complaint.assignedOfficer?.name || 'Unassigned'}`);
                doc.text(`   Created: ${new Date(complaint.createdAt).toLocaleDateString()}`);
                doc.text(`   Description: ${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}`);

                // Add page break if needed
                if (doc.y > 700) {
                    doc.addPage();
                }
            });

            // Finalize PDF
            doc.end();
        } else {
            // CSV export
            const csv = [
                ['ID', 'Title', 'Status', 'Urgency', 'Created By', 'Assigned To', 'Created At'].join(','),
                ...complaints.map(c => [
                    c.id,
                    `"${c.title.replace(/"/g, '""')}"`,
                    c.status,
                    c.urgency,
                    c.user.email,
                    c.assignedOfficer?.name || 'Unassigned',
                    c.createdAt.toISOString(),
                ].join(',')),
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=complaints-report.csv');
            res.send(csv);
        }
    });

    // Get all feedback for admin review
    static getAllFeedback = catchAsync(async (req: Request, res: Response) => {
        const feedbacks = await prisma.feedback.findMany({
            include: {
                complaint: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(feedbacks);
    });

    // Update officer's department assignment
    static updateOfficerDepartment = catchAsync(async (req: Request, res: Response) => {
        const { officerId } = req.params;
        const { departmentId } = req.body;

        const officer = await prisma.user.update({
            where: { id: officerId },
            data: {
                departmentId: departmentId || null,
            },
            include: {
                department: true,
            },
        });

        res.json(officer);
    });

    // Update complaint's department (and optionally reassign officer)
    static updateComplaintDepartment = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { departmentId, officerId } = req.body;

        const updateData: any = {
            departmentId: departmentId || null,
        };

        // If officer is provided, assign it
        if (officerId !== undefined) {
            updateData.assignedTo = officerId || null;
            if (officerId) {
                updateData.status = 'IN_PROGRESS';
            }
        }

        const complaint = await prisma.complaint.update({
            where: { id },
            data: updateData,
            include: {
                department: true,
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                    },
                },
            },
        });

        res.json(complaint);
    });

    // Advanced search with multiple criteria
    static advancedSearch = catchAsync(async (req: Request, res: Response) => {
        const {
            keyword,
            status,
            urgency,
            departmentId,
            dateFrom,
            dateTo,
            assignedStatus,
            hasFeedback
        } = req.body;

        const where: any = {};

        // Keyword search
        if (keyword) {
            where.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
                { location: { contains: keyword, mode: 'insensitive' } }
            ];
        }

        // Status filter
        if (status && status.length > 0) {
            where.status = { in: status };
        }

        // Urgency filter
        if (urgency && urgency.length > 0) {
            where.urgency = { in: urgency };
        }

        // Department filter
        if (departmentId) {
            where.departmentId = departmentId;
        }

        // Date range filter
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = endDate;
            }
        }

        // Assignment status filter
        if (assignedStatus === 'assigned') {
            where.assignedTo = { not: null };
        } else if (assignedStatus === 'unassigned') {
            where.assignedTo = null;
        }

        // Feedback filter
        if (hasFeedback === true) {
            where.feedback = { isNot: null };
        }

        const complaints = await prisma.complaint.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedOfficer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                feedback: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(complaints);
    });
    static getWeeklyReport = catchAsync(async (req: Request, res: Response) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const complaints = await prisma.complaint.findMany({
            where: {
                createdAt: {
                    gte: oneWeekAgo
                }
            },
            include: {
                user: true,
                assignedOfficer: true,
                department: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=weekly-report-${new Date().toISOString().split('T')[0]}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(24).text('JanMat Weekly Report', { align: 'center' });
        doc.fontSize(12).text(`Period: ${oneWeekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown();

        // Stats
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
        const pending = complaints.filter(c => c.status === 'PENDING').length;
        const highUrgency = complaints.filter(c => c.urgency === 'HIGH').length;

        doc.fontSize(16).text('Weekly Statistics', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Total New Complaints: ${total}`);
        doc.text(`Resolved This Week: ${resolved}`);
        doc.text(`Pending: ${pending}`);
        doc.text(`High Urgency Cases: ${highUrgency}`);
        doc.moveDown();

        // List
        doc.fontSize(16).text('Complaint Details', { underline: true });
        doc.moveDown(0.5);

        complaints.forEach((c, i) => {
            if (i > 0) doc.moveDown(0.5);
            doc.fontSize(12).fillColor('black').text(`${i + 1}. ${c.title}`);
            doc.fontSize(10).fillColor('gray').text(`   Status: ${c.status} | Dept: ${c.department?.name || 'N/A'}`);
            doc.text(`   Date: ${new Date(c.createdAt).toLocaleDateString()}`);
            if (doc.y > 700) doc.addPage();
        });

        doc.end();
    });

    static createOfficer = catchAsync(async (req: Request, res: Response) => {
        const { name, email, phone, password, departmentId, designation } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create officer
        const officer = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'OFFICER',
                departmentId,
                designation,
                isVerified: true, // Auto-verify officers created by admin
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                departmentId: true,
                designation: true,
                department: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        res.status(201).json(officer);
    });

    static updateOfficer = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, email, phone, departmentId, designation } = req.body;

        // Check if officer exists
        const existingOfficer = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingOfficer) {
            return res.status(404).json({ message: 'Officer not found' });
        }

        // Update officer
        const officer = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                departmentId,
                designation,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                departmentId: true,
                designation: true,
                department: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        res.json(officer);
    });

    static getDepartments = catchAsync(async (req: Request, res: Response) => {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: {
                        officers: true,
                        complaints: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.json(departments);
    });
}
