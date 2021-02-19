
const { Response } = require('express');
const Usuario = require('../models/usuario');

const getUsuarios = async (req, res = Response) => {

    const desde = Number( req.query.desde ) || 0;

    const usuarios = await Usuario
        .find({ _id: { $ne: req.uid }, tipo : 'P' })
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

module.exports = {
    getUsuarios
}