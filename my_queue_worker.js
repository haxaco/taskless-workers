// my_queue_worker.js

var Queue = require('firebase-queue');
var admin = require('firebase-admin');

var serviceAccount = require('./admin-sdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://taskless-dev.firebaseio.com'
});

var express = require('express');
var app     = express();
app.set('port', (process.env.PORT || 5000));


var ref = admin.database().ref('work-queue');
var queue = new Queue(ref, function(data, progress, resolve, reject) {
  // Read and process task data
  console.log(data);

  // Do some work
  progress(50).then(function(result){
    console.log('progress finished ',result);
  },function(err){
    console.log('bad stuff happened ',err);
  });

  // Finish the task asynchronously
  setTimeout(function() {
    console.log('finishing task');
    resolve();
  }, 10000);
});



//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running';
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});