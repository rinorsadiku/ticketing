import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId })
        .expect(404);
});

it('returns an error if the ticket is already preserved', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    // Create ticket
    const ticket = await Ticket.build({
        id,
        title: 'Concert',
        price: 300
    }).save();

    // Create order
    await Order.build({
        ticket,
        userId: 'dfsdf29resf',
        status: OrderStatus.Created,
        expiresAt: new Date()
    }).save()

    // Assert
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('reserves a ticket', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    // Create ticket
    const ticket = await Ticket.build({
        id,
        title: 'Concert',
        price: 300
    }).save();

    // Assert
    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })

    const orderCreated = await Order.findById(response.body.id).populate('ticket');

    expect(orderCreated!.id).toEqual(response.body.id);
    expect(orderCreated!.ticket.title).toEqual(response.body.ticket.title);
    expect(orderCreated!.userId).toEqual(response.body.userId);
});

it('emits an order-created event', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    // Create ticket
    const ticket = await Ticket.build({
        id,
        title: 'Concert',
        price: 300
    }).save();

    // Assert
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
