const { response } = require('express');
const Cita = require('../models/cita');
const Usuario = require('../models/usuario');
const {sendNotificacionPush} = require('../helpers/notificacion_push');


const crearCita = async (req, res) => {

    const miId = req.uid;
    const usuario = await Usuario.findById(miId);

    const sintomaCita = req.body.sintomas;

    try {

        const cita = new Cita();
        cita.usuario_paciente = miId;
        cita.sintomas = sintomaCita;
        cita.estado = 'SP';

        await cita.save();

        //Notificar Medicos
        const usuariosMedico = await Usuario.find({
            // $and: [{ tipo: 'M', medico_online: true }]
            $and: [{ tipo: 'M'}]
        });

        const arrAppTokenUsuario = [];
        usuariosMedico.forEach( (usuario) => {
            arrAppTokenUsuario.push(usuario.app_token);
        } );

        sendNotificacionPush(arrAppTokenUsuario, 'Cita por Chat: '+sintomaCita, usuario.nombre, 'notiCitaMedico', cita._id);

        return res.json({
            ok: true,
            cita,
            arrAppTokenUsuario
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

const aceptarCitaMedico = async (req, res) => {

    const miId = req.uid;
    const reqCita = req.params.citaId;
    const usuario = await Usuario.findById(miId);
    const cita = await Cita.findById(reqCita);

    try {

        cita.estado = "A";
        cita.usuario_medico = miId;

        await cita.updateOne( { $set: { estado: "A", usuario_medico : miId } } );

        const usuarioPaciente = await Usuario.findById(cita.usuario_paciente);

        const arrAppTokenUsuario = [];
        arrAppTokenUsuario.push(usuarioPaciente.app_token);

        sendNotificacionPush(arrAppTokenUsuario, 'Cita por Chat: Aceptada', usuario.nombre, 'chatAceptadoMedico', cita._id, miId);

        return res.json({
            ok: true,
            cita
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

const citaPaciente = async (req, res) => {

    const miId = req.uid;
    const reqTipo = req.params.tipo;

    try {

        const cita = await Cita.find( {
            $and: [{ usuario_paciente: miId, estado: 'SP', tipo: reqTipo }]
        } );



        return res.json({
            ok: true,
            cita
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

const citasMedico = async (req, res) => {

    const miId = req.uid;
    const reqTipo = req.params.tipo;

    try {

        const cita = await Cita.find( {
            $and: [{ usuario_medico: miId, estado: 'SP', tipo: reqTipo }]
        } );

        return res.json({
            ok: true,
            cita
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

const usuarioCitas = async (req, res) => {

    const miId = req.uid;
    const reqTipo = req.params.tipo;

    try {

        const citas = await Cita.find( {
            $and: [{ usuario_paciente: miId, tipo: reqTipo, estado : {"$in":["SP","A"]}}]
        } );

        return res.json({
            ok: true,
            citas
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

const getCita = async (req, res) => {

    const miId = req.uid;
    const reqCitaId = req.params.citaId;

    try {

        const cita = await Cita.find( {
            $and: [{ _id: reqCitaId}]
        } );

        return res.json({
            ok: true,
            cita
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

const citasMedicoSolicitud = async (req, res) => {

    const miId = req.uid;
    const reqTipo = req.params.tipo;
    const reqEstado = req.params.estado;

    try {

        const citas = await Cita.find( {
            $and: [{ estado: reqEstado, tipo: reqTipo }],
        } ).populate('usuario_paciente');

        return res.json({
            ok: true,
            medicoCitas: citas
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

module.exports = {
    crearCita,
    aceptarCitaMedico,
    citaPaciente,
    citasMedico,
    usuarioCitas,
    getCita,
    citasMedicoSolicitud
}