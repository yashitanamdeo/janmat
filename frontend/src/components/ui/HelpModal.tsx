import React from 'react';
import { FAQAccordion } from './FAQAccordion';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: 'CITIZEN' | 'OFFICER' | 'ADMIN';
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, role = 'CITIZEN' }) => {
    if (!isOpen) return null;

    const commonFAQs = [
        {
            question: "How do I reset my password?",
            answer: "You can reset your password by clicking on 'Forgot Password' on the login screen. Follow the instructions sent to your email."
        },
        {
            question: "How can I update my profile?",
            answer: "Go to the 'Profile' section from the top navigation bar. You can update your personal details there."
        }
    ];

    const citizenFAQs = [
        {
            question: "How do I file a complaint?",
            answer: "Click on the 'New Complaint' button on your dashboard. Fill in the details, attach any evidence, and submit."
        },
        {
            question: "How can I track my complaint status?",
            answer: "Your dashboard lists all your complaints. The status (Pending, In Progress, Resolved) is shown next to each complaint."
        },
        {
            question: "Can I provide feedback?",
            answer: "Yes, once a complaint is marked as 'Resolved', a 'Rate Resolution' button will appear. You can rate the service and leave comments."
        }
    ];

    const officerFAQs = [
        {
            question: "How do I view assigned complaints?",
            answer: "Your dashboard shows all complaints assigned to you. You can filter them by status or urgency."
        },
        {
            question: "How do I update a complaint status?",
            answer: "Open the complaint details and use the status dropdown to change the status (e.g., to 'In Progress' or 'Resolved')."
        }
    ];

    const adminFAQs = [
        {
            question: "How do I assign a complaint?",
            answer: "In the dashboard, find an unassigned complaint and click the 'Assign' button. Select an officer from the list."
        },
        {
            question: "How do I manage departments?",
            answer: "Click on the 'Manage Departments' button in the dashboard to add, edit, or remove departments."
        },
        {
            question: "Where can I see analytics?",
            answer: "Click the 'Show Analytics' button on the dashboard to view complaint trends and department performance charts."
        }
    ];

    let faqs = [...commonFAQs];
    if (role === 'CITIZEN') faqs = [...faqs, ...citizenFAQs];
    if (role === 'OFFICER') faqs = [...faqs, ...officerFAQs];
    if (role === 'ADMIN') faqs = [...faqs, ...adminFAQs];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in" onClick={onClose}>
            <div className="modern-card max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Help & Support
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Frequently Asked Questions</h3>
                    <FAQAccordion items={faqs} />
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Still need help?</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                        Contact our support team at <a href="mailto:support@janmat.gov.in" className="underline">support@janmat.gov.in</a> or call our helpline at 1800-JANMAT.
                    </p>
                </div>
            </div>
        </div>
    );
};
