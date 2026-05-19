const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined');
    }

    mongoose.set('strictQuery', false);

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = connectDB;