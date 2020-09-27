import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { indexOrderRouter } from './routes/index';
import { showOrderRouter } from './routes/show';
import { newOrderRouter } from './routes/new';
import { deleteOrderRouter } from './routes/delete';

import { errorHandler, NotFoundError, currentUser } from '@rstickets/common'

const app = express();
// app.set('trust proxy', true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        // secure: process.env.NODE_ENV !== 'test'
    })
);
// Always add user to the request object
app.use(currentUser);

// Routes
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);

app.all('/*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
