// my_queue_worker.js

var Queue = require('firebase-queue');
var admin = require('firebase-admin');

var serviceAccount = require('./admin-sdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://taskless-dev.firebaseio.com'
});

var ref = admin.database().ref('orders');
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
  }, 1000);
});