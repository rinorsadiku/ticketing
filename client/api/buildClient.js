import axios from 'axios';

export default ({ req }) => {
    if (typeof window === 'undefined') {
        // On the server
        return axios.create({
            baseURL: 'http://prod-app-ticketing.xyz',
            headers: req.headers
        });
    } else {
        // On the browser
        return axios.create({
            baseURL: '/'
        });
    }
};
