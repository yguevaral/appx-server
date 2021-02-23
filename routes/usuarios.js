/*

path: api/usuarios

*/
const { Router, response } = require('express');

const { validarJWT } = require('../middlewares/validar-jwt');
const { getUsuarios, usuarioAppToken } = require('../controllers/usuarios');

const router = Router();

router.get('/', validarJWT, getUsuarios);
router.post('/appToken', validarJWT, usuarioAppToken);

module.exports = router;