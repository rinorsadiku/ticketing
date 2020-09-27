import { Publisher, Subjects, TicketUpdatedEvent } from '@rstickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}