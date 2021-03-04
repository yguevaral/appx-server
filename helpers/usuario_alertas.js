const Usuario = require('../models/usuario');

const setAlertaUsuario = async (intIdUsuario, strTipoAlerta, boolSuma, intValorOperacion) => {

    try {
        const usuario = await Usuario.findById(intIdUsuario);

        if( strTipoAlerta == "alerta_chat" ){
            await usuario.updateOne( {
                $set: { alerta_chat: boolSuma ? ( usuario.alerta_chat + intValorOperacion ) : ( usuario.alerta_chat - intValorOperacion )}
            } );
        }

        if( strTipoAlerta == "alerta_videollamada" ){
            await usuario.updateOne( {
                $set: { alerta_videollamada: boolSuma ? ( usuario.alerta_videollamada + intValorOperacion ) : ( usuario.alerta_videollamada - intValorOperacion )}
            } );
        }

        if( strTipoAlerta == "alerta_domicilio" ){
            await usuario.updateOne( {
                $set: { alerta_domicilio: boolSuma ? ( usuario.alerta_domicilio + intValorOperacion ) : ( usuario.alerta_domicilio - intValorOperacion )}
            } );
        }

        if( strTipoAlerta == "alerta_historial" ){
            await usuario.updateOne( {
                $set: { alerta_historial: boolSuma ? ( usuario.alerta_historial + intValorOperacion ) : ( usuario.alerta_historial - intValorOperacion )}
            } );
        }

        return true;

    } catch (error) {

        console.log(error);
        return false;

    }


}

module.exports = {
    setAlertaUsuario
}