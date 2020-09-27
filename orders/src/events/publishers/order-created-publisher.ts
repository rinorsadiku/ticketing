import { Publisher, OrderCreatedEvent, Subjects } from '@rstickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}