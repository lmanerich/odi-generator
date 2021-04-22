import { Reference } from '@src/models/reference.model';
import { releaseFileService } from '@src/services/release-file.service';

describe('account service test', () => {
    test('parse file', async () => {
        const result: Reference[] = await releaseFileService.parse('');

        expect(result).toEqual([]);
    });
});
