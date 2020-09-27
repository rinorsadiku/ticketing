import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the order is not found', async () => {
    const orderId = mongoose.Types.ObjectId();

    await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', global.signin())
        .expect(404);
});

it('throws a not authorized error if the order does not belong to the user', async () => {
    const userOne = global.signin();
    const userTwo = global.signin();
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = await Ticket.build({
        id: ticketId,
        title: 'Concert',
        price: 300
    }).save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${response.body.id}`)
        .set('Cookie', userTwo)
        .expect(401);
});

it('fetches the order', async () => {
    const user = global.signin();
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = await Ticket.build({
        id: ticketId,
        title: 'Concert',
        price: 300
    }).save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(200);
});