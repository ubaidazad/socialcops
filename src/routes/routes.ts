import * as express from "express";
import * as fs from "fs";
import isUrl = require("is-url");
import jsonPatch = require("jsonpatch");
import * as jwt from "jsonwebtoken";
import * as path from "path";
import * as request from "request";
import * as url from "url";
import { authMiddleware } from "./auth-middleware";
const thumbnail = require("node-thumbnail").thumb;

const apiRoutes = express.Router();

apiRoutes.post("/authenticate", (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(403).send({
            success: false,
            message: "username or password wrong!",
        });
    }

    const payload = {
        username: req.body.username,
    };

    const token = jwt.sign(payload, "mysecretkey");
    res.send({
        success: true,
        token,
    });

});

// auth middleware
apiRoutes.use("/", authMiddleware);

apiRoutes.patch("/jsonpatch", (req, res) => {
    const json = jsonPatch.apply_patch(req.body.doc, req.body.patch);
    return res.send(json);
});

const supportedFileTypes = [".jpg", ".jpeg", ".png"];

apiRoutes.post("/thumbnail", async (req, res) => {
    if (!isUrl(req.body.imageUrl)) {
        return res.json({
            success: false,
            message: "image url not correct.",
        });
    }

    if (supportedFileTypes.indexOf(path.extname(req.body.imageUrl)) < 0) {
        return res.json({
            success: false,
            message: "given file extension not supported.",
        });
    }
    try {
        const imagePath = await download(req.body.imageUrl);
        return res.send(imagePath);
    } catch (e) {
        return res.json({
            success: false,
            message: 'cannot download from the url given'
        })
    }
});

interface IFileCacheDict {
    imagePath: string;
    originalUri: string;
}

const fileCache: { [key: string]: IFileCacheDict } = {};

function download(uri: string): Promise<string> {
    // convert actual uri to base64 encoding for filename 
    const fileName = new Buffer(uri).toString("base64") + path.extname(uri);
    const filePath = path.join("images", fileName);
    return new Promise((resolve, reject) => {
        // get cached images.
        if (fileCache[fileName]) {
            return resolve(fileCache[fileName].imagePath);
        }

        // request the given uri
        var imageRequest = request(uri, (err, res, body) => {
            // throw error if we got error or response isnt success
            if (err || res.statusCode !== 200) {
                throw err;
            }
        });

        // save image data.
        let imageData: any[] = [];
        imageRequest.on('data', (data) => {
            imageData.push(data);
        });

        imageRequest.on('end', () => {
            const buffer = Buffer.concat(imageData);

            // save original image.
            fs.writeFile(filePath, buffer, 'binary', (err) => {
                if (err) throw err;

                // save thumbnail
                thumbnail({
                    source: filePath,
                    destination: "thumbnails",
                    suffix: "",
                    width: 50,
                    height: 50,
                    overwrite: true,
                }).then((response: any) => {
                    // save the uri for future use
                    // could be redis, or any other db
                    fileCache[fileName] = {
                        originalUri: uri,
                        imagePath: filePath,
                    };
                }).catch((err: any) => {
                    reject(err.toString());
                });

                // resolve path before actually saving the image.
                return resolve(filePath);
            });
        });

    });
}
export { apiRoutes };
