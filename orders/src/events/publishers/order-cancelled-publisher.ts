import { Publisher, Subjects, OrderCancelledEvent } from '@rstickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}