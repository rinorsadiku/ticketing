import axios from 'axios';

export default ({ req }) => {
    if (typeof window === 'undefined') {
        // On the server
        return axios.create({
            baseURL: process.env.BASE_URL,
            headers: req.headers
        });
    } else {
        // On the browser
        return axios.create({
            baseURL: '/'
        });
    }
};
