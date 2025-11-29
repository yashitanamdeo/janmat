import PDFDocument from 'pdfkit';
import { Response } from 'express';
import prisma from '../config/db';

export class ReportingService {
    static async generateComplaintReport(res: Response, filters: any) {
        const complaints = await prisma.complaint.findMany({
            where: filters,
            include: { user: true },
        });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=complaints_report.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Janmat - Complaints Report', { align: 'center' });
        doc.moveDown();

        complaints.forEach((complaint, index) => {
            doc.fontSize(12).text(`${index + 1}. ${complaint.title}`);
            doc.fontSize(10).text(`Status: ${complaint.status} | Urgency: ${complaint.urgency}`);
            doc.text(`Description: ${complaint.description}`);
            doc.text(`User: ${complaint.user.email}`);
            doc.moveDown();
        });

        doc.end();
    }

    static async generateCSVReport(res: Response, filters: any) {
        const complaints = await prisma.complaint.findMany({
            where: filters,
            include: { user: true },
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=complaints_report.csv');

        const headers = ['ID', 'Title', 'Status', 'Urgency', 'Description', 'User Email', 'Created At'];
        res.write(headers.join(',') + '\n');

        complaints.forEach((complaint) => {
            const row = [
                complaint.id,
                `"${complaint.title}"`,
                complaint.status,
                complaint.urgency,
                `"${complaint.description}"`,
                complaint.user.email,
                complaint.createdAt.toISOString(),
            ];
            res.write(row.join(',') + '\n');
        });

        res.end();
    }
}
