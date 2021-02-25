/*

path: api/usuarios

*/
const { Router, response } = require('express');

const { validarJWT } = require('../middlewares/validar-jwt');
const { getUsuarios, usuarioAppToken, setEnLinea } = require('../controllers/usuarios');

const router = Router();

router.get('/', validarJWT, getUsuarios);
router.post('/appToken', validarJWT, usuarioAppToken);
router.get('/enlinea/:enlinea', validarJWT, setEnLinea);

module.exports = router;