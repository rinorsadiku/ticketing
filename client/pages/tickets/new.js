import { useState } from 'react';
import useRequest from '../../hooks/useRequest';
import Router from 'next/router';

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: (ticket) => Router.push('/')
    })

    const onBlur = () => {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            return;
        }
        setPrice(parsedPrice.toFixed(2));
    }

    const onSubmit = (event) => {
        event.preventDefault();

        doRequest();
    }

    return <div>
        <h1>Create a ticket</h1>
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} type="text" />
            </div>
            <div className="form-group">
                <label>Price</label>
                <input
                    className="form-control"
                    value={price}
                    onBlur={onBlur}
                    onChange={(e) => setPrice(e.target.value)}
                    type="text"
                />
            </div>
            {errors}
            <button className="btn btn-primary">Submit</button>
        </form>
    </div>
};

export default NewTicket;