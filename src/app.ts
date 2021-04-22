import routes from '@src/routes';
import express from 'express';

const app: express.Application = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.use(express.static('public'));

routes(app);

export default app;
