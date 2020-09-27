import { Publisher, Subjects, TicketCreatedEvent } from '@rstickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}