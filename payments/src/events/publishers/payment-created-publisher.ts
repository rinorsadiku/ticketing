import { Publisher, Subjects, PaymentCreatedEvent } from '@rstickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}