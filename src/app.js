'use strict'

const path = require('path');
const colors = require('colors');
const express = require('express');

const port = 4000;
const app = express();

const { router } = require('./routes/routers');

app.set('appName', 'Vitalplayer');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(router);

app.get('*', (req, res) => {
    res.send('Achivo no encontrado');
})

app.listen(port, () => {
    console.log('Server on port:'.green, `${port}`.yellow);
});