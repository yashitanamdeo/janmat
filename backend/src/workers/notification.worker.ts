import amqp from 'amqplib';
import nodemailer from 'nodemailer';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Check if email is configured
const isEmailConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

// Email Transporter (only if credentials are provided)
let transporter: nodemailer.Transporter | null = null;

if (isEmailConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 5000, // 5 second timeout
        greetingTimeout: 5000,
    });
    console.log('✉️  Email service configured');
} else {
    console.log('⚠️  Email service not configured - notifications will be logged only');
}

export const startNotificationWorker = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue('notifications', { durable: true });

        console.log('📬 Notification Worker waiting for messages...');

        channel.consume('notifications', async (msg) => {
            if (msg) {
                try {
                    const data = JSON.parse(msg.content.toString());
                    console.log('📨 Processing notification:', data);

                    // Send Email (only if configured)
                    if (data.type === 'EMAIL') {
                        if (transporter && isEmailConfigured) {
                            try {
                                await transporter.sendMail({
                                    from: '"Janmat System" <no-reply@janmat.com>',
                                    to: data.to,
                                    subject: data.subject,
                                    text: data.text,
                                });
                                console.log(`✅ Email sent to ${data.to}`);
                            } catch (emailError) {
                                console.error(`❌ Failed to send email to ${data.to}:`, emailError instanceof Error ? emailError.message : emailError);
                            }
                        } else {
                            console.log(`📧 [MOCK] Would send email to ${data.to}: ${data.subject}`);
                        }
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error('❌ Error processing notification:', error);
                    // Acknowledge anyway to prevent infinite retries
                    channel.ack(msg);
                }
            }
        });
    } catch (error) {
        console.error('❌ Notification Worker Error:', error);
        // Don't crash the server if RabbitMQ is unavailable
        console.log('⚠️  Notification worker will retry on next restart');
    }
};
