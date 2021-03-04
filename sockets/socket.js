const { io } = require('../index');

const { comprobarJWT } = require('../helpers/jwt');
const { usuarioConectado, usuarioDesconectado, grabarMensaje } = require('../controllers/socket')

// Mensajes de Sockets
io.on('connection', client => {
    console.log('Cliente conectado');

    const [valido, uid] = comprobarJWT(client.handshake.headers['x-token']);

    //Verificar autenticacion
    if( !valido ) {
        console.log('Cliente rechazado');
        return client.disconnect();
    }

    // Cliente autenticado
    usuarioConectado(uid);

    // Ingresar al usuario a una sala en particular
    // sala global, client.id

    client.join(uid);

    // Escuchar del cliente un mensaje
    client.on('mensaje-personal', async ( payload ) => {

        console.log(payload['mensaje']);
        if( payload['mensaje'] != 'F1n@liz@Ch@t' )
            await grabarMensaje(payload);

        io.to(payload.para).emit('mensaje-personal', payload);
    });


    client.on('disconnect', () => {
        console.log('Cliente desconectado');
        usuarioDesconectado(uid);
    });

    // client.on('mensaje', ( payload ) => {
    //     console.log('Mensaje', payload);

    //     io.emit( 'mensaje', { admin: 'Nuevo mensaje' } );

    // });


});
