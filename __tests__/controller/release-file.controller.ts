import app from '@src/app';
import request from 'supertest';

describe('release file controller test', () => {
    test('GET /balance without account_id', async () => {
        const result = await request(app).get('/balance');
        expect(result.status).toEqual(404);
    });
});
