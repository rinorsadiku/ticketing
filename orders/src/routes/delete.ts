import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/order';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@rstickets/common';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
    '/api/orders/:orderId',
    requireAuth,
    [
        param('orderId')
            .not()
            .isEmpty()
            .custom((input: string): boolean => mongoose.Types.ObjectId.isValid(input))
            .withMessage('OrderId must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        // Publish an event saying this order was cancelled
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            ticket: {
                id: order.ticket.id
            },
            version: order.version
        });

        res.status(204).send(order);
    }
);

export { router as deleteOrderRouter };