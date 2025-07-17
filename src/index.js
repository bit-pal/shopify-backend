const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const geolocationMiddleware = require('./middleware/geolocation');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(geolocationMiddleware);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/questionnaires', require('./routes/questionnaire'));
app.use('/api/drchrono', require('./routes/drChrono'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/geolocation', require('./routes/geolocation'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payment', require('./routes/payments'));
// Base route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to SXRX API',
    clientLocation: req.clientLocation
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 