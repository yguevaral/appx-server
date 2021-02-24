/*

path: /api/cita

*/

const { Router, response } = require('express');

const { validarJWT } = require('../middlewares/validar-jwt');
const { crearCita, aceptarCitaMedico, citaPaciente, citasMedico, usuarioCitas } = require('../controllers/cita');

const router = Router();

router.post('/', validarJWT, crearCita)
router.get('/:tipo', validarJWT, usuarioCitas)
router.get('/paciente/:tipo', validarJWT, citaPaciente)
router.get('/medico/:citaId', validarJWT, aceptarCitaMedico)
router.get('/medicocita:tipo', validarJWT, citasMedico)

module.exports = router;