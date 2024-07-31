'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // Simple Usage (Enable All CORS Requests)
const routes = require('./routes'); //add routes
const app = express(); // create the Express app
app.use(express.json()); // Setup request body JSON parsing.
app.use(cors());  //Add CORS
app.use('/api', routes); // Add routes.

//const { sequelize, models } = require('./models');
const sequelize = require('./models').sequelize; // import Sequelize

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';



// setup morgan which gives us http request logging
app.use(morgan('dev'));

// set our port
app.set('port', process.env.PORT || 5000);


// //Simple Usage (Enable All CORS Requests)
// app.get('/courses/:id', function (req, res, next) {
//   res.json({msg: 'This is CORS-enabled for all origins!'})
// })

// app.get('/courses/', function (req, res, next) {
//   res.json({msg: 'This is CORS-enabled for all origins!'})
// })
 
app.listen(80, function () {
  console.log('CORS-enabled web server listening on port 80')
})




// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});






//Test the connection to the database
(async () => {

  try {  
    await sequelize.authenticate();
    console.log('Testing the connection to the database');
    
    // Sync the models
    console.log('Synchronizing the models with the database...');
    await sequelize.sync();

  }  catch(error) {
      console.error('Unable to connect to the database', error);
  }    
  
})();



// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});



// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});
