/*

path: api/usuarios

*/
const { Router, response } = require('express');

const { validarJWT } = require('../middlewares/validar-jwt');
const { getUsuarios } = require('../controllers/usuarios');

const router = Router();

router.get('/', validarJWT, getUsuarios)

module.exports = router;