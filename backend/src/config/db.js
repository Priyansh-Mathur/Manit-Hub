const mongoose = require('mongoose');

let connectPromise = null;

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined');
    }

    if (
        process.env.NODE_ENV === 'production' &&
        (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1'))
    ) {
        throw new Error('Refusing to use a localhost Mongo URI in production');
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectPromise) {
        return connectPromise;
    }

    mongoose.set('strictQuery', false);

    connectPromise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
    })
        .then((connection) => {
            console.log('MongoDB Connected');
            return connection;
        })
        .catch((error) => {
            console.log(error);
            connectPromise = null;
            throw error;
        });

    return connectPromise;
};

module.exports = connectDB;