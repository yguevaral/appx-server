/*

path: /api/cita

*/

const { Router, response } = require('express');

const { validarJWT } = require('../middlewares/validar-jwt');
const { crearCita, aceptarCitaMedico, citaPaciente, citasMedico, usuarioCitas, getCita, citasMedicoSolicitud, rechazaCitaMedico, finalizaCitaMedico } = require('../controllers/cita');

const router = Router();

router.post('/', validarJWT, crearCita)
router.get('/:tipo', validarJWT, usuarioCitas)
router.get('/paciente/:tipo', validarJWT, citaPaciente)
router.get('/medico/:citaId', validarJWT, aceptarCitaMedico)
router.get('/medicoRechazo/:citaId', validarJWT, rechazaCitaMedico)
router.get('/medicoFinaliza/:citaId', validarJWT, finalizaCitaMedico)
router.get('/medicocita:tipo', validarJWT, citasMedico)
router.get('/medicocitasolicitud/:tipo/:estado', validarJWT, citasMedicoSolicitud)
router.get('/detalle/:citaId', validarJWT, getCita)

module.exports = router;