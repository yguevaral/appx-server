
const Usuario = require('../models/usuario');
const Mensaje = require('../models/mensaje');
const { sendNotificacionPush } = require('../helpers/notificacion_push');

const usuarioConectado = async (uid = '') => {

    const usuario = await Usuario.findById(uid);
    usuario.online = true;
    await usuario.save();
    return usuario

}


const usuarioDesconectado = async (uid = '') => {

    const usuario = await Usuario.findById(uid);
    usuario.online = false;
    await usuario.save();
    return usuario

}

const grabarMensaje = async (payload) => {

    /*
    {
        de: '',
        para: '',
        mensaje: ''
    }
    */
    try {

        const mensaje = new Mensaje(payload);
        await mensaje.save();

        const usuario = await Usuario.findById(payload.para);
        if( !usuario.online ){
            const usuarioDe = await Usuario.findById(payload.de);

            const arrAppTokenUsuario = [];
            arrAppTokenUsuario.push(usuario.app_token);
            sendNotificacionPush(arrAppTokenUsuario,  payload.mensaje, usuarioDe.nombre, 'chatPendiente', payload.de);

        }


        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    usuarioConectado,
    usuarioDesconectado,
    grabarMensaje
}