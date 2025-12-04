import React, { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="border rounded-xl overflow-hidden transition-all duration-200"
                    style={{ borderColor: 'var(--border-color)' }}
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex justify-between items-center p-4 text-left font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        <span>{item.question}</span>
                        <svg
                            className={`w-5 h-5 transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-200 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="p-4 pt-0 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {item.answer}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
