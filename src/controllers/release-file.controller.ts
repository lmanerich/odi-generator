import { releaseFileService } from '@src/services/release-file.service';
import { Request, Response } from 'express';

export const releaseFileController = {
    parse: async (req: Request, res: Response): Promise<void> => {
        console.log(1);
        try {
            //const multerParser = multer({ storage: multer.memoryStorage() });
            //const parser = util.promisify(multerParser.single('file'));
            //await parser(req, res);

            const file = req.file;
            console.log(file);

            const references = await releaseFileService.parse(file.buffer.toString());
            releaseFileService.getSpreadSheet(res, references);
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    },
};
