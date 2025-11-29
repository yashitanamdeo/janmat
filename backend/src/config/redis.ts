import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// In-memory store for mock mode
const mockStore = new Map<string, { value: string; expiry?: number }>();

// Create a wrapper that handles errors gracefully
class RedisWrapper {
    private client: Redis | null = null;
    private useMock = false;

    constructor() {
        try {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 1,
                enableOfflineQueue: false,
                retryStrategy: (times) => {
                    if (times > 3) {
                        console.warn('Redis connection failed, using mock mode');
                        this.useMock = true;
                        return null;
                    }
                    return Math.min(times * 50, 2000);
                }
            });

            this.client.on('connect', () => {
                console.log('Redis connected');
                this.useMock = false;
            });

            this.client.on('error', (err: any) => {
                if (!this.useMock) {
                    console.warn('Redis error, falling back to mock:', err.message);
                    this.useMock = true;
                }
            });

            this.client.on('close', () => {
                this.useMock = true;
            });
        } catch (error) {
            console.warn('Could not initialize Redis, using mock mode');
            this.useMock = true;
        }
    }

    async get(key: string): Promise<string | null> {
        if (this.useMock || !this.client) {
            const item = mockStore.get(key);
            if (!item) return null;
            if (item.expiry && Date.now() > item.expiry) {
                mockStore.delete(key);
                return null;
            }
            return item.value;
        }

        try {
            return await this.client.get(key);
        } catch (error) {
            console.warn('Redis get failed, using mock');
            this.useMock = true;
            return this.get(key);
        }
    }

    async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
        if (this.useMock || !this.client) {
            const expiry = mode === 'EX' && duration ? Date.now() + duration * 1000 : undefined;
            mockStore.set(key, { value, expiry });
            return 'OK';
        }

        try {
            if (mode === 'EX' && duration) {
                return await this.client.set(key, value, mode, duration);
            }
            return await this.client.set(key, value);
        } catch (error) {
            console.warn('Redis set failed, using mock');
            this.useMock = true;
            return this.set(key, value, mode, duration);
        }
    }

    async del(key: string): Promise<number> {
        if (this.useMock || !this.client) {
            const existed = mockStore.has(key);
            mockStore.delete(key);
            return existed ? 1 : 0;
        }

        try {
            return await this.client.del(key);
        } catch (error) {
            console.warn('Redis del failed, using mock');
            this.useMock = true;
            return this.del(key);
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (this.client) {
            this.client.on(event, callback);
        }
    }

    get status() {
        if (this.useMock) return 'mock';
        return this.client?.status || 'disconnected';
    }
}

const redis = new RedisWrapper();

export default redis;
