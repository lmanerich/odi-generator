import { releaseFileController } from '@src/controllers/release-file.controller';
import express from 'express';
import multer from 'multer';

export default (app: express.Application) => {
    const upload = multer({ storage: multer.memoryStorage() });
    app.route('/api/parse').post(upload.single('file'), releaseFileController.parse);
};
