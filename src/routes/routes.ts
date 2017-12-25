import * as express from 'express';
import { authMiddleware } from './auth-middleware';
import * as jwt from 'jsonwebtoken';
import * as request from 'request';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import isUrl = require('is-url');
import jsonPatch = require('jsonpatch');
const thumbnail = require('node-thumbnail').thumb;

const apiRoutes = express.Router();

apiRoutes.post('/authenticate', (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(403).send({
            success: false,
            message: 'username or password wrong!'
        });
    }

    const payload = {
        username: req.body.username
    };

    const token = jwt.sign(payload, 'mysecretkey');
    res.send({
        success: true,
        token: token
    });

});

// auth middleware
apiRoutes.use('/', authMiddleware);

apiRoutes.patch('/jsonpatch', (req, res) => {
    const json = jsonPatch.apply_patch(req.body.doc, req.body.patch);
    return res.send(json);
});

const supportedFileTypes = ['.jpg', '.jpeg', '.png'];

apiRoutes.post('/thumbnail', async (req, res) => {
    if (!isUrl(req.body.imageUrl)) {
        return res.json({
            success: false,
            message: 'image url not correct.'
        });
    }

    if (supportedFileTypes.indexOf(path.extname(req.body.imageUrl)) < 0) {
        return res.json({
            success: false,
            message: 'given file extension not supported.'
        });
    }
    const imagePath = await download(req.body.imageUrl);
    return res.send(imagePath);
});

interface FileCache {
    imagePath: string;
    originalUri: string;
}

const fileCache: { [key: string]: FileCache } = {};

function download(uri: string): Promise<string> {
    const fileName = new Buffer(uri).toString('base64') + path.extname(uri);
    const filePath = path.join('images', fileName);
    return new Promise((resolve, reject) => {
        if (fileCache[fileName]) {
            return resolve(fileCache[fileName].imagePath);
        }
        request(uri).pipe(fs.createWriteStream(filePath).on('close', () => {
            thumbnail({
                source: filePath,
                destination: 'thumbnails',
                suffix: '',
                width: 50,
                height: 50,
                overwrite: true
            }).then((response: any) => {
                fileCache[fileName] = {
                    originalUri: uri,
                    imagePath: filePath,
                }
            }).catch((err: any) => {
                console.log('error: ', err.toString());
            });
            return resolve(filePath);
        }));

    });
}
export { apiRoutes };
