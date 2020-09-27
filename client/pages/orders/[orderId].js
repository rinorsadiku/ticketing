import { useEffect, useState } from 'react';
import useRequest from '../../hooks/useRequest';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        }

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        const clearTimer = () => {
            clearInterval(timerId);
        }
        return clearTimer
    }, [])

    if (timeLeft < 0) {
        return <div>Order Expired</div>
    }

    return <div>
        Time left to pay: {timeLeft}
        <StripeCheckout
            token={({ id }) => doRequest({ token: id })}
            stripeKey="pk_test_51HS0D6IBWGbpg68tsDkKcQb20IRO6aDd7leZTkrp6X0lQGFtDpaOsQgeDEsatTgCp3ZLmMWLOCzlCCC1jkOQtCBA00oHU09xln"
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
    </div>
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    console.log(data);

    return { order: data };
}

export default OrderShow;