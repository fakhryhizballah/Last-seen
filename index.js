require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const http = require('http');
const server = http.createServer(app);
const morgan = require('morgan');
const MORGAN_FORMAT = process.env.MORGAN_FORMAT || 'dev';
app.use(morgan(MORGAN_FORMAT));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/*+json' }));

const routes = require('./routes');
app.use('/api/ls', routes);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});