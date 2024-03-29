
const { Response } = require('express');
const Usuario = require('../models/usuario');

const getUsuarios = async (req, res = Response) => {

    const desde = Number( req.query.desde ) || 0;

    const usuarios = await Usuario
        // .find({ _id: { $ne: req.uid }, tipo : 'P' })
        .find({ _id: { $ne: req.uid } })
        .sort('-online')
        .skip(desde)
        .limit(20);

    res.json({
        ok : true,
        msg: "getUsuarios",
        desde: desde,
        usuarios: usuarios
    });

}

const usuarioAppToken = async (req, res) => {

    const miId = req.uid;
    const { token, plataforma } = req.body;

    try {

        console.log(miId);
        const usuario = await Usuario.findOne( {_id: miId} );

        usuario.plataforma = plataforma;
        usuario.app_token = token;
        await usuario.updateOne( { $set: { app_token: token, plataforma : plataforma } } );


        return res.json({
            ok: true,
            usuario
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

const setEnLinea = async (req, res) => {

    const miId = req.uid;
    const reqEnLinea = req.params.enlinea;

    boolLinea = reqEnLinea == "Y" ? true : false;

    try {
        const usuario = await Usuario.findById(miId);

        await usuario.updateOne( { $set: { medico_online: boolLinea} } );

        return res.json({
            ok: true
        });

    } catch (error) {

        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });

    }


}

const getAlertas = async (req, res) => {

    const miId = req.uid;

    try {
        const usuario = await Usuario.findById(miId);

        return res.json({
            ok: true,
            alerta_chat: usuario.alerta_chat,
            alerta_videollamada: usuario.alerta_videollamada,
            alerta_domicilio: usuario.alerta_domicilio,
            alerta_historial: usuario.alerta_historial,
        });

    } catch (error) {

        console.log(error);
        return res.json({
            ok: false,
            alerta_chat: 0,
            alerta_videollamada: 0,
            alerta_domicilio: 0,
            alerta_historial: 0,
        });

    }
}

module.exports = {
    getUsuarios,
    usuarioAppToken,
    setEnLinea,
    getAlertas
}