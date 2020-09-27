import { Listener, OrderCancelledEvent, Subjects } from '@rstickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // Find the ticket
        const ticket = await Ticket.findById(data.ticket.id);

        // Throw if not ticket found
        if (!ticket) throw new Error('Ticket not found');

        // Mark the ticket as being available
        ticket.set({ orderId: undefined });

        // Save the ticket
        await ticket.save();

        // Publish ticket updated event
        new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });

        // ack the message
        msg.ack()
    }
}