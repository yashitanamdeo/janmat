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
            },
        });

        res.json(officers);
    });

    static assignComplaint = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { officerId } = req.body;

        const complaint = await prisma.complaint.update({
            where: { id },
            data: {
                assignedTo: officerId,
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

        res.json(complaint);
    });

    static assignComplaintAlt = catchAsync(async (req: Request, res: Response) => {
        const { complaintId, officerId } = req.body;

        const complaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: {
                assignedTo: officerId,
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
}
