import * as express from "express";
import { authMiddleware } from "./auth-middleware";
import * as user from "./user";
import * as util from "./util";

const apiRoutes = express.Router();

/**
 * authenticates a username and password
 * sends back jsonwebtoken
 */
apiRoutes.post("/authenticate", user.authenticate);

/**
 * Auth Middleware to protect the routes
 * verifies the jsonwebtoken.
 */
apiRoutes.use(authMiddleware);

/**
 * does jsonpatch for the given doc and patch object.
 */
apiRoutes.patch("/jsonpatch", util.doPatch);

/**
 * downloads images based on given url
 * and generates 50x50 image thumbnail
 */
apiRoutes.post("/thumbnail", util.generateThumbnail);

export { apiRoutes };
