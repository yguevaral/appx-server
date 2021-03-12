var axios = require('axios');
var FormData = require('form-data');

const fntGetCredencialesAffiPay = (boolProduccion) => {

    var arrCredenciales = [];

    if (boolProduccion) {

        arrCredenciales['username'] = 'appx@appxperience.com';
        arrCredenciales['password'] = '43e44945bfe2ba172ced17a9e4b9f39fb94244558d358187843447aa218cbb7d';
        arrCredenciales['auth_basic'] = 'Ymx1bW9uX3BheV9lY29tbWVyY2VfYXBpOmJsdW1vbl9wYXlfZWNvbW1lcmNlX2FwaV9wYXNzd29yZA==';
        arrCredenciales['urlToken'] = 'http://52.22.36.22:9000';
        arrCredenciales['urlEcommerceCharge'] = 'http://52.22.36.22:9020';

    }
    else {

        arrCredenciales['username'] = 'appx@appxperience.com';
        arrCredenciales['password'] = '43e44945bfe2ba172ced17a9e4b9f39fb94244558d358187843447aa218cbb7d';
        arrCredenciales['auth_basic'] = 'Ymx1bW9uX3BheV9lY29tbWVyY2VfYXBpOmJsdW1vbl9wYXlfZWNvbW1lcmNlX2FwaV9wYXNzd29yZA==';
        arrCredenciales['urlToken'] = 'http://52.22.36.22:9000';
        arrCredenciales['urlEcommerceCharge'] = 'http://52.22.36.22:9020';


    }

    return arrCredenciales;
}

const fntGetTokenAuthAffiPay = async (boolProduccion) => {

    var arrCredenciales = fntGetCredencialesAffiPay(boolProduccion);

    var data = new FormData();
    data.append('grant_type', 'password');
    data.append('username', arrCredenciales['username']);
    data.append('password', arrCredenciales['password']);

    var config = {
        method: 'post',
        url: arrCredenciales['urlToken'] + '/oauth/token',
        headers: {
            'Authorization': 'Basic ' + arrCredenciales['auth_basic'],
            ...data.getHeaders()
        },
        data: data
    };

    var res = '';
    await axios(config)
        .then(function (response) {
            res = response.data['access_token'];

        })
        .catch(function (error) {
            console.log(error);
            res = "";
        });
    return res;
}

const fntSetCobroTCAffiPay = async (boolProduccion, strTokenAuth, arrData) => {

    var arrCredenciales = fntGetCredencialesAffiPay(boolProduccion);

    var data = JSON.stringify({
        "amount": arrData['monto'],
        "currency": arrData['moneda'],
        "customerInformation": {
            "firstName": arrData['nombre'],
            "lastName": arrData['apellidos'],
            "middleName": "",
            "email": arrData['email'],
            "phone1": arrData['telefono'],
            "city": arrData['ciudad'],
            "address1": arrData['direccion'],
            "postalCode": arrData['codigo_postal'],
            "state": arrData['estado'],
            "country": arrData['pais'],
            " ip": arrData['ip']
        },
        "noPresentCardData": {
            "cardNumber": arrData['tc_numero'],
            "cvv": arrData['tc_cvv'],
            "cardholderName": arrData['tc_nombre'],
            "expirationYear": arrData['tc_anio'],
            "expirationMonth": arrData['tc_mes']
        }
    });

    var config = {
        method: 'post',
        url: arrCredenciales['urlEcommerceCharge'] + '/ecommerce/charge',
        headers: {
            'Authorization': 'Bearer ' + strTokenAuth,
            'Content-Type': 'application/json'
        },
        data: data
    };

    var arr = Array();
    await axios(config)
        .then(function (response) {
            arr['api'] = true;
            arr['respuesta'] = response.data;

        })
        .catch(function (error) {

            console.log(error);
            arr['api'] = false;
            arr['respuesta'] = [];

        });
    return arr;

}

module.exports = {
    fntGetTokenAuthAffiPay,
    fntGetCredencialesAffiPay,
    fntSetCobroTCAffiPay
}
