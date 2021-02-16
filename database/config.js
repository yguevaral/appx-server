const mongoose = require('mongoose');


const dbConnection = async () => {

    try {

        console.log('Init db config base de datos');

        await mongoose.connect(process.env.DB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        console.log('db online');

    }
    catch(error){
        console.log(error);
        throw new Error('Error de coneccion a base de datos');
    }

}

module.exports = {
    dbConnection
}