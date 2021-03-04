const { Schema, model } = require('mongoose');

const CitaRechazoSchema = Schema({

    idCita: {
        type: Schema.Types.ObjectId,
        ref: 'Cita',
        required: true
    },
    usuario_medico: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false,
        default: null
    }
}, {
    timestamps: true
});

CitaRechazoSchema.method('toJSON', function(){

    const {__v, ...object} = this.toObject();
    return object

});

module.exports = model('CitaRechazo', CitaRechazoSchema );