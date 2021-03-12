const { response } = require('express');
const Cita = require('../models/cita');
const Usuario = require('../models/usuario');
const CitaRechazo = require('../models/cita_rechazo');
const { sendNotificacionPush } = require('../helpers/notificacion_push');

const { setAlertaUsuario } = require('../helpers/usuario_alertas');
const { grabarMensaje } = require('../controllers/socket')
const { getCobrosAppx } = require('../helpers/cobro_appx')

const { fntGetTokenAuthAffiPay, fntSetCobroTCAffiPay } = require('../helpers/affipay')


const crearCita = async (req, res) => {

    const miId = req.uid;

    const sintomaCita = req.body.sintomas;
    const tipoCita = req.body.tipo;

    try {
        const usuario = await Usuario.findById(miId);
        const boolPagoProduccion = false;
        const cita = new Cita();
        cita.usuario_paciente = miId;
        cita.sintomas = sintomaCita;
        cita.estado = 'C';
        cita.tipo = tipoCita;

        const strTipoNoti = tipoCita == "C" ? "alerta_chat" : "alerta_videollamada";

        await cita.save();

        if (cita.id != null) {

            const strTokenAffiPay = await fntGetTokenAuthAffiPay(boolPagoProduccion);

            if (strTokenAffiPay != "") {

                var arrCobroAppx = getCobrosAppx();
                var sinMonto = tipoCita == "C" ? arrCobroAppx['cita_chat'] : arrCobroAppx['cita_videollamada'];

                arrData = [];
                arrData['monto'] = sinMonto;
                arrData['moneda'] = '320';
                arrData['nombre'] = usuario.nombre;
                arrData['apellidos'] = '';
                arrData['email'] = usuario.email;
                arrData['telefono'] = '';
                arrData['ciudad'] = 'Guatemala';
                arrData['direccion'] = 'Guatemala city';
                arrData['codigo_postal'] = '01001';
                arrData['estado'] = 'GTM';
                arrData['pais'] = 'GTM';
                arrData['ip'] = req.connection.remoteAddress;
                arrData['tc_numero'] = req.body.tc_numero;
                arrData['tc_cvv'] = req.body.tc_cvv;
                arrData['tc_nombre'] = req.body.tc_nombre;
                arrData['tc_anio'] = req.body.tc_anio;
                arrData['tc_mes'] = req.body.tc_mes;

                const arrResPagoAffiPay = await fntSetCobroTCAffiPay(boolPagoProduccion, strTokenAffiPay, arrData);

                if (arrResPagoAffiPay['api']) {

                    if (arrResPagoAffiPay['respuesta']['status'] && arrResPagoAffiPay['respuesta']['dataResponse']['description'] == 'APROBADA') {

                        cita.estado = 'SP';
                        cita.respuesta_pago_cita = JSON.stringify(arrResPagoAffiPay['respuesta']);

                        await cita.updateOne({ $set: { estado: "SP", respuesta_pago_cita: JSON.stringify(arrResPagoAffiPay['respuesta']) } });

                        //Notificar Medicos
                        const usuariosMedico = await Usuario.find({
                            $and: [{ tipo: 'M', medico_online: true }]
                        });

                        const arrAppTokenUsuario = [];
                        usuariosMedico.forEach(async (usuario) => {
                            arrAppTokenUsuario.push(usuario.app_token);
                            setAlertaUsuario(usuario.id, strTipoNoti, true, 1);
                        });

                        if (tipoCita == "C") {
                            sendNotificacionPush(arrAppTokenUsuario, 'Cita por Chat: ' + sintomaCita, usuario.nombre, 'notiCitaMedico_chat', cita._id);
                        }
                        else {
                            sendNotificacionPush(arrAppTokenUsuario, 'Cita por Video Llamada: ' + sintomaCita, usuario.nombre, 'notiCitaMedico_llamada', cita._id);

                        }

                        return res.json({
                            ok: true,
                            citas: cita,
                            arrAppTokenUsuario
                        });

                    }
                    else {

                        await cita.updateOne({ $set: { estado: "ER", respuesta_pago_cita: JSON.stringify(arrResPagoAffiPay['respuesta']) } });

                        return res.status(200).json({
                            ok: false,
                            msg: 'Error en tu Tarjeta, verifica los datos ingresados o el saldo en tu tarjeta'
                        });
                    }

                }
                else {

                    await cita.updateOne({ $set: { estado: "ER", respuesta_pago_cita: "error_api" } });

                    return res.status(200).json({
                        ok: false,
                        msg: 'Cita No disponible'
                    });
                }


            }
            else {
                return res.status(200).json({
                    ok: false,
                    msg: 'Cita No disponible'
                });
            }


        }
        else {

            await cita.updateOne({ $set: { estado: "ER"} });

            return res.status(200).json({
                ok: false,
                msg: 'Cita No disponible'
            });

        }



    }
    catch (error) {
        console.log(error);
        return res.status(200).json({
            ok: false,
            msg: 'Servicio No disponible'
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

        await cita.updateOne({ $set: { estado: "A", usuario_medico: miId } });

        const usuarioPaciente = await Usuario.findById(cita.usuario_paciente);
        setAlertaUsuario(usuarioPaciente.id, strTipoNoti, true, 1);
        setAlertaUsuario(miId, strTipoNoti, false, 1);

        const arrAppTokenUsuario = [];
        arrAppTokenUsuario.push(usuarioPaciente.app_token);

        sendNotificacionPush(arrAppTokenUsuario, 'Cita por Chat: Aceptada', usuario.nombre, 'chatAceptadoMedico', cita._id, miId, cita.tipo);

        datosMensajeInicial = {
            de: usuarioPaciente.id,
            para: miId,
            mensaje: "Mis Síntomas son: " + cita.sintomas
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

        const cita = await Cita.find({
            $and: [{ usuario_paciente: miId, estado: 'SP', tipo: reqTipo }]
        });



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

        const cita = await Cita.find({
            $and: [{ usuario_medico: miId, estado: 'SP', tipo: reqTipo }]
        });

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

        const citas = await Cita.find({
            $and: [{ usuario_paciente: miId, tipo: reqTipo, estado: { "$in": ["SP", "A"] } }]
        });

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

        const cita = await Cita.find({
            $and: [{ _id: reqCitaId }]
        });

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
        if (reqEstado == "A") {

            citas = await Cita.find({
                $and: [{ usuario_medico: miId, estado: reqEstado, tipo: reqTipo }],
            }).populate('usuario_paciente');

            arrMedicoCitas = citas;

        }

        if (reqEstado == "SP") {

            citas = await Cita.find({
                $and: [{ estado: reqEstado, tipo: reqTipo }],
            }).populate('usuario_paciente');

            const citaRechazo = await CitaRechazo.find({
                $and: [{ usuario_medico: miId }]
            });

            var arrMedicoCitas = [];

            for (i = 0; i < citas.length; i++) {

                var boolPush = true;
                for (j = 0; j < citaRechazo.length; j++) {

                    if (citas[i]['_id'].toString() == citaRechazo[j]['idCita'].toString()) {
                        boolPush = false;
                    }

                }

                if (boolPush) {
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

        await cita.updateOne({ $set: { estado: "F" } });

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
            'Authorization': 'Basic Ymx1bW9uX3BheV9lY29tbWVyY2VfYXBpOmJsdW1vbl9wYXlfZWNvbW1lcmNlX2FwaV9wYXNzd29yZA==',
            ...data.getHeaders()
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            return res.json({
                ok: JSON.stringify(response.data)
            });
        })
        .catch(function (error) {
            console.log(error);
            return res.json({
                ok: error
            });
        });


}

const getPrecioCita = async (req, res) => {

    var arrCobroAppx = getCobrosAppx();

    var sinMonto = req.params.tipo == "C" ? arrCobroAppx['cita_chat'] : arrCobroAppx['cita_videollamada'];

    return res.json({
        ok: true,
        monto: 'Q '+sinMonto
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
    setPruebaPagoAffipay,
    getPrecioCita
}