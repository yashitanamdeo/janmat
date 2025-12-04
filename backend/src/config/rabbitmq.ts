import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

class RabbitMQService {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

    async connect() {
        try {
            const conn = await amqp.connect(RABBITMQ_URL);
            this.connection = conn as unknown as amqp.Connection;
            this.channel = await conn.createChannel();
            await this.channel.assertQueue('notifications', { durable: true });
            console.log('RabbitMQ connected');
        } catch (error) {
            console.error('RabbitMQ connection error:', error);
        }
    }

    async sendNotification(data: any) {
        if (!this.channel) {
            await this.connect();
        }
        if (this.channel) {
            this.channel.sendToQueue('notifications', Buffer.from(JSON.stringify(data)), { persistent: true });
        }
    }
}

export const rabbitMQService = new RabbitMQService();
