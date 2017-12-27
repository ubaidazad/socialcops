import { Request, Response } from "express";
import * as fs from "fs";
import isUrl = require("is-url");
import jsonPatch = require("jsonpatch");
import * as path from "path";
import * as request from "request";
import * as url from "url";
import { IFileCacheDict } from "../types/types";
const thumbnail = require("node-thumbnail").thumb;

export function doPatch(req: Request, res: Response) {
    if (!req.body.doc || !req.body.patch) {
        return res.json({
            success: false,
            message: "doc or path object not valid.",
        });
    }
    const json = jsonPatch.apply_patch(req.body.doc, req.body.patch);
    return res.send(json);
}

const supportedFileTypes = [".jpg", ".jpeg", ".png"];

export async function generateThumbnail(req: Request, res: Response) {
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
            message: "cannot download from the url given",
        });
    }
}

const fileCache: { [key: string]: IFileCacheDict } = {};

function download(uri: string): Promise<string> {
    // convert actual uri to base64 encoding for filename
    const fileName = new Buffer(uri).toString("base64") + path.extname(uri);
    const filePath = path.join("images", fileName);

    return new Promise<string>((resolve, reject) => {
        // get cached images.
        if (fileCache[fileName]) {
            return resolve(fileCache[fileName].imagePath);
        }

        // request the given uri
        const imageRequest = request(uri, (err, res, body) => {
            // throw error if we got error or response isnt success
            if (err || res.statusCode !== 200) {
                reject("cannot download the given image.");
            }
        });

        // save image data.
        const imageData: any[] = [];
        imageRequest.on("data", (data) => {
            imageData.push(data);
        });

        imageRequest.on("end", () => {
            const buffer = Buffer.concat(imageData);

            // save original image.
            fs.writeFile(filePath, buffer, "binary", (err) => {
                if (err) { throw err; }

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
                    resolve(filePath);
                }).catch((error: any) => {
                    reject(error.toString());
                });
            });
        });

    });
}
