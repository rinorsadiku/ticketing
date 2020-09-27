import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket, TicketDoc } from '../../models/ticket';

const buildTicket = async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const ticket = await Ticket.build({
        id,
        title: 'Concert',
        price: 300
    }).save();
    return ticket;
};

const createOrder = async (user: string[], ticket: TicketDoc) => {
    return await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
}

it('fetches orders for a particular user', async () => {
    // Create three tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    const userOne = global.signin();
    const userTwo = global.signin();

    // Create one order as user #1
    await createOrder(userOne, ticketOne);

    // Create two orders as user #2
    const { body: orderOne } = await createOrder(userTwo, ticketTwo);
    const { body: orderTwo } = await createOrder(userTwo, ticketThree);

    // Make request to get orders for user #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    // Make sure we only got the orders for user #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});