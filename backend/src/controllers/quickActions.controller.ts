import { Request, Response } from 'express';
import prisma from '../config/db';
import catchAsync from '../utils/catchAsync';

export class QuickActionsController {
    // Auto-assign all urgent complaints to available officers
    static autoAssignUrgent = catchAsync(async (req: Request, res: Response) => {
        // Get all unassigned HIGH urgency complaints
        const urgentComplaints = await prisma.complaint.findMany({
            where: {
                urgency: 'HIGH',
                assignedTo: null,
                status: {
                    in: ['PENDING', 'IN_PROGRESS']
                }
            },
            include: {
                department: true
            }
        });

        // Get officers with their current workload
        const officers = await prisma.user.findMany({
            where: {
                role: 'OFFICER'
            },
            include: {
                assignedComplaints: {
                    where: {
                        status: {
                            in: ['PENDING', 'IN_PROGRESS']
                        }
                    }
                },
                department: true
            }
        });

        let assignedCount = 0;

        for (const complaint of urgentComplaints) {
            // Find officers in the same department or any officer if no department
            const eligibleOfficers = officers.filter((officer: any) =>
                !complaint.departmentId || officer.departmentId === complaint.departmentId
            );

            if (eligibleOfficers.length === 0) continue;

            // Find officer with least workload
            const leastBusyOfficer = eligibleOfficers.reduce((prev: any, curr: any) =>
                prev.assignedComplaints.length < curr.assignedComplaints.length ? prev : curr
            );

            await prisma.complaint.update({
                where: { id: complaint.id },
                data: {
                    assignedTo: leastBusyOfficer.id,
                    departmentId: leastBusyOfficer.departmentId, // Auto-assign department
                    status: 'IN_PROGRESS',
                    timeline: {
                        create: {
                            status: 'IN_PROGRESS',
                            comment: `Auto-assigned to ${leastBusyOfficer.name} (urgent complaint)`,
                            updatedBy: 'System'
                        }
                    }
                }
            });

            // Send notification
            await prisma.notification.create({
                data: {
                    userId: leastBusyOfficer.id,
                    message: `Urgent complaint auto-assigned: ${complaint.title}`,
                    type: 'WARNING'
                }
            });

            assignedCount++;
        }

        res.json({
            success: true,
            message: `Successfully auto-assigned ${assignedCount} urgent complaints`,
            assignedCount
        });
    });

    // Balance workload across all officers
    static balanceWorkload = catchAsync(async (req: Request, res: Response) => {
        // Get all unassigned complaints
        const unassignedComplaints = await prisma.complaint.findMany({
            where: {
                assignedTo: null,
                status: {
                    in: ['PENDING', 'IN_PROGRESS']
                }
            },
            include: {
                department: true
            },
            orderBy: {
                urgency: 'desc' // Prioritize urgent ones
            }
        });

        // Get officers with workload
        const officers = await prisma.user.findMany({
            where: {
                role: 'OFFICER'
            },
            include: {
                assignedComplaints: {
                    where: {
                        status: {
                            in: ['PENDING', 'IN_PROGRESS']
                        }
                    }
                },
                department: true
            }
        });

        let balancedCount = 0;

        for (const complaint of unassignedComplaints) {
            const eligibleOfficers = officers.filter((officer: any) =>
                !complaint.departmentId || officer.departmentId === complaint.departmentId
            );

            if (eligibleOfficers.length === 0) continue;

            const leastBusyOfficer = eligibleOfficers.reduce((prev: any, curr: any) =>
                prev.assignedComplaints.length < curr.assignedComplaints.length ? prev : curr
            );

            await prisma.complaint.update({
                where: { id: complaint.id },
                data: {
                    assignedTo: leastBusyOfficer.id,
                    departmentId: leastBusyOfficer.departmentId, // Auto-assign department
                    status: 'IN_PROGRESS',
                    timeline: {
                        create: {
                            status: 'IN_PROGRESS',
                            comment: `Assigned to ${leastBusyOfficer.name} (workload balancing)`,
                            updatedBy: 'System'
                        }
                    }
                }
            });

            // Send notification
            await prisma.notification.create({
                data: {
                    userId: leastBusyOfficer.id,
                    message: `Complaint assigned (workload balancing): ${complaint.title}`,
                    type: 'INFO'
                }
            });

            // Update local workload count
            leastBusyOfficer.assignedComplaints.push(complaint as any);
            balancedCount++;
        }

        res.json({
            success: true,
            message: `Successfully balanced ${balancedCount} complaints across officers`,
            balancedCount
        });
    });

    // Send reminders to officers about pending complaints
    static sendReminders = catchAsync(async (req: Request, res: Response) => {
        const officers = await prisma.user.findMany({
            where: {
                role: 'OFFICER'
            },
            include: {
                assignedComplaints: {
                    where: {
                        status: {
                            in: ['PENDING', 'IN_PROGRESS']
                        }
                    }
                }
            }
        });

        let remindersSent = 0;

        for (const officer of officers) {
            if (officer.assignedComplaints.length > 0) {
                await prisma.notification.create({
                    data: {
                        userId: officer.id,
                        message: `You have ${officer.assignedComplaints.length} pending complaints. Please review and update their status.`,
                        type: 'INFO'
                    }
                });
                remindersSent++;
            }
        }

        res.json({
            success: true,
            message: `Sent reminders to ${remindersSent} officers`,
            remindersSent
        });
    });

    // Escalate overdue complaints
    static escalateOverdue = catchAsync(async (req: Request, res: Response) => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const overdueComplaints = await prisma.complaint.findMany({
            where: {
                status: {
                    in: ['PENDING', 'IN_PROGRESS']
                },
                createdAt: {
                    lt: threeDaysAgo
                },
                urgency: {
                    not: 'HIGH'
                }
            }
        });

        let escalatedCount = 0;

        for (const complaint of overdueComplaints) {
            await prisma.complaint.update({
                where: { id: complaint.id },
                data: {
                    urgency: 'HIGH',
                    timeline: {
                        create: {
                            status: complaint.status,
                            comment: 'Escalated to HIGH urgency due to being overdue',
                            updatedBy: 'System'
                        }
                    }
                }
            });
            escalatedCount++;
        }

        res.json({
            success: true,
            message: `Escalated ${escalatedCount} overdue complaints to HIGH urgency`,
            escalatedCount
        });
    });

    // Archive resolved complaints older than 30 days
    static archiveResolved = catchAsync(async (req: Request, res: Response) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const resolvedComplaints = await prisma.complaint.findMany({
            where: {
                status: 'RESOLVED',
                resolvedAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        // In a real system, you might move these to an archive table
        // For now, we'll just add a timeline entry
        let archivedCount = 0;

        for (const complaint of resolvedComplaints) {
            await prisma.complaintTimeline.create({
                data: {
                    complaintId: complaint.id,
                    status: 'RESOLVED',
                    comment: 'Archived (resolved >30 days ago)',
                    updatedBy: 'System'
                }
            });
            archivedCount++;
        }

        res.json({
            success: true,
            message: `Archived ${archivedCount} resolved complaints`,
            archivedCount,
            note: 'Complaints marked as archived in timeline. In production, these would be moved to archive storage.'
        });
    });
}
