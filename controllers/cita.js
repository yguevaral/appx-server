const { response } = require('express');
const Cita = require('../models/cita');
const Usuario = require('../models/usuario');
const CitaRechazo = require('../models/cita_rechazo');
const {sendNotificacionPush} = require('../helpers/notificacion_push');

const { setAlertaUsuario } = require('../helpers/usuario_alertas');
const { grabarMensaje } = require('../controllers/socket')



const crearCita = async (req, res) => {

    const miId = req.uid;

    const sintomaCita = req.body.sintomas;
    const tipoCita = req.body.tipo;

    try {
        const usuario = await Usuario.findById(miId);

        const cita = new Cita();
        cita.usuario_paciente = miId;
        cita.sintomas = sintomaCita;
        cita.estado = 'SP';
        cita.tipo = tipoCita;

        const strTipoNoti = tipoCita == "C" ? "alerta_chat" : "alerta_videollamada";

        await cita.save();

        //Notificar Medicos
        const usuariosMedico = await Usuario.find({
            $and: [{ tipo: 'M', medico_online: true }]
            // $and: [{ tipo: 'M'}]
        });

        const arrAppTokenUsuario = [];
        usuariosMedico.forEach( async (usuario) => {
            arrAppTokenUsuario.push(usuario.app_token);
            setAlertaUsuario(usuario.id, strTipoNoti, true, 1);
        } );

        if( tipoCita == "C" ){
            sendNotificacionPush(arrAppTokenUsuario, 'Cita por Chat: '+sintomaCita, usuario.nombre, 'notiCitaMedico_chat', cita._id);
        }
        else{
            sendNotificacionPush(arrAppTokenUsuario, 'Cita por Video Llamada: '+sintomaCita, usuario.nombre, 'notiCitaMedico_llamada', cita._id);

        }

        return res.json({
            ok: true,
            citas: cita,
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

    try {

        const usuario = await Usuario.findById(miId);
        const cita = await Cita.findById(reqCita);

        cita.estado = "A";
        cita.usuario_medico = miId;

        const strTipoNoti = cita.tipo == "C" ? "alerta_chat" : "alerta_videollamada";

        await cita.updateOne( { $set: { estado: "A", usuario_medico : miId } } );

        const usuarioPaciente = await Usuario.findById(cita.usuario_paciente);
        setAlertaUsuario(usuarioPaciente.id, strTipoNoti, true, 1);
        setAlertaUsuario(miId, strTipoNoti, false, 1);

        const arrAppTokenUsuario = [];
        arrAppTokenUsuario.push(usuarioPaciente.app_token);

        sendNotificacionPush(arrAppTokenUsuario, 'Cita por Chat: Aceptada', usuario.nombre, 'chatAceptadoMedico', cita._id, miId, cita.tipo);

        datosMensajeInicial = {
            de : usuarioPaciente.id,
            para: miId,
            mensaje: "Mis Síntomas son: "+cita.sintomas
        }

        const dddddd = await grabarMensaje(datosMensajeInicial);
        console.log(dddddd);
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

        var citas;
        if( reqEstado == "A" ){

            citas = await Cita.find( {
                $and: [{ usuario_medico: miId, estado: reqEstado, tipo: reqTipo }],
            } ).populate('usuario_paciente');

            arrMedicoCitas = citas;

        }

        if( reqEstado == "SP" ){

            citas = await Cita.find( {
                $and: [{ estado: reqEstado, tipo: reqTipo }],
            } ).populate('usuario_paciente');

            const citaRechazo = await CitaRechazo.find( {
                $and: [{ usuario_medico: miId}]
            } );

            var arrMedicoCitas = [];

            for( i = 0; i < citas.length; i++ ){

                var boolPush = true;
                for( j = 0; j < citaRechazo.length; j++ ){

                    if( citas[i]['_id'].toString() == citaRechazo[j]['idCita'].toString()){
                        boolPush = false;
                    }

                }

                if( boolPush ){
                    arrMedicoCitas.push(citas[i]);
                }

            }



        }

        return res.json({
            ok: true,
            medicoCitas: arrMedicoCitas
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

const rechazaCitaMedico = async (req, res) => {

    const miId = req.uid;
    const reqCita = req.params.citaId;

    try {

        const usuario = await Usuario.findById(miId);
        const cita = await Cita.findById(reqCita);

        const citaRechazo = new CitaRechazo();

        citaRechazo.idCita = reqCita;
        citaRechazo.usuario_medico = miId;

        await citaRechazo.save();

        const strTipoNoti = cita.tipo == "C" ? "alerta_chat" : "alerta_videollamada";

        setAlertaUsuario(miId, strTipoNoti, false, 1);


        return res.json({
            ok: true,
            citaRechazo
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

const finalizaCitaMedico = async (req, res) => {

    const miId = req.uid;
    const reqCita = req.params.citaId;

    try {

        // const usuario = await Usuario.findById(miId);
        const cita = await Cita.findById(reqCita);
        const strTipoNoti = cita.tipo == "C" ? "alerta_chat" : "alerta_videollamada";

        await cita.updateOne( { $set: { estado: "F"} } );

        setAlertaUsuario(cita.usuario_paciente, strTipoNoti, false, 1);

        return res.json({
            ok: true
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

const setPruebaPagoAffipay = async (req, res) => {


    var axios = require('axios');
    var FormData = require('form-data');
    var data = new FormData();
    data.append('grant_type', 'password');
    data.append('username', 'appx@appxperience.com');
    data.append('password', '43e44945bfe2ba172ced17a9e4b9f39fb94244558d358187843447aa218cbb7d');

    var config = {
    method: 'post',
    url: 'http://52.22.36.22:9000/oauth/token',
    headers: {
        ...data.getHeaders()
    },
    data : data
    };

    axios(config)
    .then(function (response) {
    console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
    console.log(error);
    });


}

module.exports = {
    crearCita,
    aceptarCitaMedico,
    citaPaciente,
    citasMedico,
    usuarioCitas,
    getCita,
    citasMedicoSolicitud,
    rechazaCitaMedico,
    finalizaCitaMedico,
    setPruebaPagoAffipay
}