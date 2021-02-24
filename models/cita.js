const { Schema, model } = require('mongoose');

const CitaSchema = Schema({

    usuario_paciente: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    usuario_medico: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false,
        default: null
    },
    estado: {
        type: String,
        required: true
    },
    sintomas: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: false,
        default: "C"
    }
}, {
    timestamps: true
});

CitaSchema.method('toJSON', function(){

    const {__v, ...object} = this.toObject();
    return object

});

module.exports = model('Cita', CitaSchema );