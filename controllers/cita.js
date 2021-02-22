const { response } = require('express');
const Cita = require('../models/cita');
const Usuario = require('../models/usuario');


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

const aceptarCitaMedico = async (req, res) => {

    const miId = req.uid;
    const reqCita = req.params.citaId;
    const usuario = await Usuario.findById(miId);
    const cita = await Cita.findById(reqCita);

    try {

        cita.estado = "A";
        cita.usuario_medico = miId;

        await cita.updateOne( { $set: { estado: "A", usuario_medico : miId } } );

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

module.exports = {
    crearCita,
    aceptarCitaMedico
}