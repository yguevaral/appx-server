/*

path: /api/cita

*/

const { Router, response } = require('express');

const { validarJWT } = require('../middlewares/validar-jwt');
const { crearCita, aceptarCitaMedico } = require('../controllers/cita');

const router = Router();

router.post('/', validarJWT, crearCita)
router.get('/medico/:citaId', validarJWT, aceptarCitaMedico)

module.exports = router;