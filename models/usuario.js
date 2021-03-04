const { Schema, model } = require('mongoose');
const { init } = require('./cita');

const UsuarioSchema = Schema({

    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    online: {
        type: Boolean,
        default: false
    },
    tipo: {
        type: String,
        default: 'P'
    },
    sintoma: {
        type: String,
        default: ''
    },
    edad: {
        type: String,
        default: ''
    },
    plataforma: {
        type: String,
        default: ''
    },
    app_token: {
        type: String,
        default: ''
    },
    medico_online: {
        type: Boolean,
        default: false
    },
    alerta_chat: {
        type: Number,
        default: 0
    },
    alerta_videollamada: {
        type: Number,
        default: 0
    },
    alerta_domicilio: {
        type: Number,
        default: 0
    },
    alerta_historial: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

UsuarioSchema.method('toJSON', function(){

    const {__v, _id, password, ...object} = this.toObject();
    object.uid = _id;
    return object

});

module.exports = model('Usuario', UsuarioSchema );