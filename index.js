const express = require('express');
const path = require('path');
require('dotenv').config();

//db config
require('./database/config').dbConnection();

// App de Express
const app = express();

// Lectura y parseo del body
app.use(express.json());

// Node Server
const server = require('http').createServer(app);

module.exports.io = require('socket.io')(server);
require('./sockets/socket');





// Path público
const publicPath = path.resolve( __dirname, 'public' );
app.use( express.static( publicPath ) );

// Rutas
app.use( '/api/login', require('./routes/auth') );
app.use( '/api/usuarios', require('./routes/usuarios') );
app.use( '/api/mensajes', require('./routes/mensajes') );
app.use( '/api/cita', require('./routes/cita') );






server.listen( process.env.PORT || 3000, ( err ) => {

    if ( err ) throw new Error(err);

    console.log('Servidor corriendo en puerto', process.env.PORT );

    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: ' + add);
    })

});


