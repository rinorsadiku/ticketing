import { Subjects, Publisher, ExpirationCompleteEvent } from '@rstickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}