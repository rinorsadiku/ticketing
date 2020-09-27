import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@rstickets/common';

const router = express.Router();

router.get(
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
        const order = await Order.findById(req.params.orderId,).populate('ticket');
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        res.send(order);
    });

export { router as showOrderRouter };