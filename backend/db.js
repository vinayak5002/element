const mongoose = require('mongoose');

// Replace the connection string with your own
const connectionString = 'mongodb+srv://vizz:vizzard@cluster0.jni7dnx.mongodb.net/element?retryWrites=true&w=majority';

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((error) => {
  console.log('MongoDB connection error:', error.message);
});

const db = mongoose.connection;

module.exports = db;