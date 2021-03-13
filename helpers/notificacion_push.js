var axios = require('axios');

const sendNotificacionPush = (arrtokenAppFB, strBody, strTitle, strAccion, strLlave1 = '', strLlave2 = '', strLlave3 = '', strLlave4 = '') => {

    var data = JSON.stringify({
        "notification": {
            "body": strBody,
            "title": strTitle
        },
        "priority":"high",
        "data": {
            "click_action":"FLUTTER_NOTIFICATION_CLICK",
            "accion":strAccion,
            "llave1":strLlave1,
            "llave2":strLlave2,
            "llave3":strLlave3,
            "llave4":strLlave4,
        },
        "registration_ids":  arrtokenAppFB});
    var config = {
        method: 'post',
        url: 'https://fcm.googleapis.com/fcm/send',
        headers: {
            'Authorization': 'key='+process.env.FIREBASE_SECRET_PUSH_NOTIFICATION,
            'Content-Type': 'application/json'
        },
        data : data
    };

    axios(config)
    .then(function (response) {
        console.log(response);
        return JSON.stringify(response.data.success) > 0 ? true : false;
    })
    .catch(function (error) {
        return false;
    });

}

module.exports = {
    sendNotificacionPush
}