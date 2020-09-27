import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

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
    const id = new mongoose.Types.ObjectId().toHexString();

    const ticket = await Ticket.build({
        id,
        title: 'Concert',
        price: 300
    }).save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${response.body.id}`)
        .set('Cookie', userTwo)
        .expect(401);
});


it('marks an order as canceled', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    // create a ticket with Ticket model
    const ticket = await Ticket.build({
        id,
        title: 'Concert',
        price: 300
    }).save();

    const user = global.signin();

    // make a request to create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    // expectation to make sure the thing is cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order-cancelled event', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    // create a ticket with Ticket model
    const ticket = await Ticket.build({
        id,
        title: 'Concert',
        price: 300
    }).save();

    const user = global.signin();

    // make a request to create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

