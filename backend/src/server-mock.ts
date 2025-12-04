import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory data store
let users = [
    { id: '1', name: 'John Doe', email: 'citizen@test.com', role: 'CITIZEN', password: 'password' },
    { id: '2', name: 'Officer Smith', email: 'officer@test.com', role: 'OFFICER', password: 'password' },
    { id: '3', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN', password: 'password' },
];

let complaints = [
    {
        id: '1',
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues near the intersection',
        status: 'PENDING',
        urgency: 'HIGH',
        location: '28.6139,77.2090',
        userId: '1',
        assignedTo: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
    },
    {
        id: '2',
        title: 'Street Light Not Working',
        description: 'Street light has been out for 3 days on Park Avenue',
        status: 'IN_PROGRESS',
        urgency: 'MEDIUM',
        location: '28.6129,77.2295',
        userId: '1',
        assignedTo: '2',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
    },
    {
        id: '3',
        title: 'Garbage Not Collected',
        description: 'Garbage has not been collected for over a week',
        status: 'RESOLVED',
        urgency: 'LOW',
        userId: '1',
        assignedTo: '2',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
    },
    {
        id: '4',
        title: 'Water Leakage',
        description: 'Water pipe leaking on residential street',
        status: 'PENDING',
        urgency: 'HIGH',
        location: '28.6189,77.2190',
        userId: '1',
        assignedTo: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: []
    }
];

let complaintIdCounter = 5;

// Helper function to get user from token
const getUserFromToken = (req: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    // In mock, we'll extract user info from token (in real app, verify JWT)
    if (token && token.startsWith('mock-token-')) {
        const userId = token.replace('mock-token-', '');
        return users.find(u => u.id === userId);
    }
    return users[0]; // Default to first user for testing
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        user: userWithoutPassword,
        token: `mock-token-${user.id}`
    });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (users.find(u => u.email === email)) {
        return res.status(400).json({
            success: false,
            message: 'Email already exists'
        });
    }

    const newUser = {
        id: String(users.length + 1),
        name,
        email,
        role: role || 'CITIZEN',
        password
    };

    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    res.json({
        success: true,
        user: userWithoutPassword,
        token: `mock-token-${newUser.id}`
    });
});

// User profile endpoints
app.get('/api/auth/profile', (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        data: userWithoutPassword
    });
});

app.put('/api/auth/profile', (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, email } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;

    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        data: userWithoutPassword
    });
});

// Complaint endpoints
app.get('/api/complaints', (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Admin and Officer can see all complaints
    if (user.role === 'ADMIN' || user.role === 'OFFICER') {
        return res.json({
            success: true,
            data: complaints
        });
    }

    // Citizens see only their complaints
    const userComplaints = complaints.filter(c => c.userId === user.id);
    res.json({
        success: true,
        data: userComplaints
    });
});

app.get('/api/complaints/my-complaints', (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userComplaints = complaints.filter(c => c.userId === user.id);
    res.json({
        success: true,
        data: userComplaints
    });
});

app.get('/api/complaints/:id', (req, res) => {
    const complaint = complaints.find(c => c.id === req.params.id);
    if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({
        success: true,
        data: complaint
    });
});

app.post('/api/complaints', (req, res) => {
    try {
        const user = getUserFromToken(req);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Handle both JSON and FormData
        const title = req.body.title || req.body.get?.('title');
        const description = req.body.description || req.body.get?.('description');
        const urgency = req.body.urgency || req.body.get?.('urgency') || 'MEDIUM';
        const location = req.body.location || req.body.get?.('location');

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }

        const newComplaint = {
            id: String(complaintIdCounter++),
            title,
            description,
            urgency,
            location: location || '',
            status: 'PENDING',
            userId: user.id,
            assignedTo: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attachments: []
        };

        complaints.push(newComplaint);
        console.log('✅ Complaint created:', newComplaint.id, '-', newComplaint.title);

        res.json({
            success: true,
            data: newComplaint
        });
    } catch (error) {
        console.error('❌ Error creating complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.put('/api/complaints/:id', (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const complaint = complaints.find(c => c.id === req.params.id);
    if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizens can only update their own complaints
    if (user.role === 'CITIZEN') {
        if (complaint.userId !== user.id) {
            return res.status(403).json({ success: false, message: 'You can only edit your own complaints' });
        }

        // Citizens can update title, description, urgency, and location
        if (req.body.title) complaint.title = req.body.title;
        if (req.body.description) complaint.description = req.body.description;
        if (req.body.urgency) complaint.urgency = req.body.urgency;
        if (req.body.location !== undefined) complaint.location = req.body.location;
        complaint.updatedAt = new Date().toISOString();
    }

    // Officers and admins can update status and assignments
    if (user.role === 'OFFICER' || user.role === 'ADMIN') {
        if (req.body.status) complaint.status = req.body.status;
        if (req.body.assignedTo) complaint.assignedTo = req.body.assignedTo;
        if (req.body.title) complaint.title = req.body.title;
        if (req.body.description) complaint.description = req.body.description;
        if (req.body.urgency) complaint.urgency = req.body.urgency;
        if (req.body.location !== undefined) complaint.location = req.body.location;
        complaint.updatedAt = new Date().toISOString();
    }

    console.log('✅ Complaint updated:', complaint.id, '-', complaint.title);

    res.json({
        success: true,
        data: complaint
    });
});

app.delete('/api/complaints/:id', (req, res) => {
    const user = getUserFromToken(req);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const index = complaints.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Only admin or complaint owner can delete
    if (user.role === 'ADMIN' || complaints[index].userId === user.id) {
        complaints.splice(index, 1);
        res.json({ success: true, message: 'Complaint deleted' });
    } else {
        res.status(403).json({ success: false, message: 'Forbidden' });
    }
});

// Officer endpoints
app.get('/api/officer/assigned-complaints', (req, res) => {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'OFFICER') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const assignedComplaints = complaints.filter(c => c.assignedTo === user.id);
    res.json({
        success: true,
        data: assignedComplaints
    });
});

app.post('/api/officer/update-status/:id', (req, res) => {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'OFFICER') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const complaint = complaints.find(c => c.id === req.params.id);
    if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = req.body.status;
    complaint.updatedAt = new Date().toISOString();

    res.json({
        success: true,
        data: complaint
    });
});

// Admin endpoints
app.get('/api/admin/analytics', (req, res) => {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const analytics = {
        totalComplaints: complaints.length,
        pending: complaints.filter(c => c.status === 'PENDING').length,
        inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: complaints.filter(c => c.status === 'RESOLVED').length,
        highUrgency: complaints.filter(c => c.urgency === 'HIGH').length,
        mediumUrgency: complaints.filter(c => c.urgency === 'MEDIUM').length,
        lowUrgency: complaints.filter(c => c.urgency === 'LOW').length,
        totalUsers: users.length,
        citizens: users.filter(u => u.role === 'CITIZEN').length,
        officers: users.filter(u => u.role === 'OFFICER').length,
        admins: users.filter(u => u.role === 'ADMIN').length,
    };

    res.json({
        success: true,
        data: analytics
    });
});

app.get('/api/admin/users', (req, res) => {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json({
        success: true,
        data: usersWithoutPasswords
    });
});

app.get('/api/admin/officers', (req, res) => {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const officers = users.filter(u => u.role === 'OFFICER').map(({ password, ...user }) => user);
    res.json({
        success: true,
        data: officers
    });
});

app.post('/api/admin/assign-complaint', (req, res) => {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { complaintId, officerId } = req.body;
    const complaint = complaints.find(c => c.id === complaintId);

    if (!complaint) {
        return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTo = officerId;
    complaint.status = 'IN_PROGRESS';
    complaint.updatedAt = new Date().toISOString();

    res.json({
        success: true,
        data: complaint
    });
});

app.get('/api/admin/reports/complaints', (req, res) => {
    const user = getUserFromToken(req);
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Mock CSV/PDF export
    const format = req.query.format || 'json';
    if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
        const csv = 'ID,Title,Status,Urgency,Created\n' +
            complaints.map(c => `${c.id},${c.title},${c.status},${c.urgency},${c.createdAt}`).join('\n');
        res.send(csv);
    } else {
        res.json({
            success: true,
            data: complaints
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Mock server running on http://localhost:${PORT}`);
    console.log(`📝 Note: Using mock data - Prisma requires Node.js 22+`);
    console.log(`\n👥 Test Accounts:`);
    console.log(`   Citizen: citizen@test.com / password`);
    console.log(`   Officer: officer@test.com / password`);
    console.log(`   Admin: admin@test.com / password`);
});
