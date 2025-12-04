// Utility functions for exporting data

export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values that might contain commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? '';
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = async (data: any[], filename: string, title: string) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // For a simple PDF export, we'll create an HTML table and use print functionality
    // For production, you'd want to use a library like jsPDF or pdfmake

    const headers = Object.keys(data[0]);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${filename} - ${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                h1 {
                    color: #333;
                    margin-bottom: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background-color: #4F46E5;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .meta {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div class="meta">Generated on: ${new Date().toLocaleString()}</div>
            <div class="meta">Total Records: ${data.length}</div>
            <table>
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h.charAt(0).toUpperCase() + h.slice(1)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }
};

export const formatComplaintsForExport = (complaints: any[]) => {
    return complaints.map(c => ({
        ID: c.id,
        Title: c.title,
        Description: c.description,
        Status: c.status,
        Urgency: c.urgency,
        Location: c.location || 'N/A',
        'Created At': new Date(c.createdAt).toLocaleDateString(),
        'Updated At': new Date(c.updatedAt).toLocaleDateString(),
    }));
};

export const formatUsersForExport = (users: any[]) => {
    return users.map(u => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
    }));
};
