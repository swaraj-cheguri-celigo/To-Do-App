const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
const port = 3000;
const logger = require('./middlewares/logger');
const path = require('path');
const swaggerDocs = require('./swagger');
// Middleware
app.use(bodyParser.json());
// Swagger Docs
swaggerDocs(app);
// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/todoApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


// Routes
app.use(logger);
app.use('/api', authRoutes);
app.use('/api', todoRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(errorHandler);
// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger API Docs available at http://localhost:${port}/api-docs`);
});
