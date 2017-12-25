import * as express from "express";
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import { apiRoutes } from './routes/routes';

const app = express();
const port = process.env.port || 3000;

// configure app to get info from URL's
app.use(bodyParser.urlencoded({ extended: false }));
// configure app to get info from POST requests
app.use(bodyParser.json());

// configure logging
app.use(morgan('dev'));

// configure routes
app.use('/api', apiRoutes);

// listen server on port
app.listen(port, () => console.log(`listening on port ${port}!`));
