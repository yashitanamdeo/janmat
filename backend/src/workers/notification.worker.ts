import amqp from 'amqplib';
import nodemailer from 'nodemailer';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Mock Email Transporter (Use real credentials in production)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASS || 'test',
    },
});

export const startNotificationWorker = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue('notifications', { durable: true });

        console.log('Notification Worker waiting for messages...');

        channel.consume('notifications', async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                console.log('Processing notification:', data);

                // Send Email
                if (data.type === 'EMAIL') {
                    await transporter.sendMail({
                        from: '"Janmat System" <no-reply@janmat.com>',
                        to: data.to,
                        subject: data.subject,
                        text: data.text,
                    });
                    console.log(`Email sent to ${data.to}`);
                }

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Notification Worker Error:', error);
    }
};
