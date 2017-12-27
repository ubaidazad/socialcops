import * as bodyParser from "body-parser";
import * as express from "express";
import * as morgan from "morgan";
import { apiRoutes } from "./routes/routes";
import * as mkdirp from 'mkdirp';

const app = express();
const port = 3000;
const host = '0.0.0.0';

// configure app to get info from URL's
app.use(bodyParser.urlencoded({ extended: false }));
// configure app to get info from POST requests
app.use(bodyParser.json());

// configure logging
app.use(morgan('combined'));

// configure routes
app.use("/api", apiRoutes);

// create required directories
mkdirp('images', () => { });
mkdirp('thumbnails', () => { })

// listen server on port
const server = app.listen(port, host);
console.log(`app listening on port ${host}:${port}!`);

module.exports = {
    server,
    app,
};
