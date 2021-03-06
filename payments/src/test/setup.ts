import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin(id?: string): string[];
        }
    }
}

jest.mock('../nats-wrapper.ts')
jest.setTimeout(30000);

process.env.STRIPE_KEY = 'sk_test_51HS0D6IBWGbpg68tzbXao1EP2oup3qWJ3RgDCpSjMD3vz7JBUDke5lafjRo8M1q7JKSj2HDZOEwx7FZFe3EVSB8000HehhXnxe'

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasdf';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?: string) => {
    // Build a JWT payload. {id, email}
    const payload = {
        id: id || mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object {jwt: MY_JWT}
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string thats a cookie with the encoded data
    return [`express:sess=${base64}`];
};