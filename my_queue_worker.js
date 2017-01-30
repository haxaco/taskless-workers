// my_queue_worker.js
var express = require('express');
var Queue = require('firebase-queue');
var admin = require('firebase-admin');
var helper = require('sendgrid').mail;
//firebase creds
var serviceAccount = require('./admin-sdk.json');

//initialize firebase admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://taskless-dev.firebaseio.com'
});
var ref = admin.database().ref('work-queue');

//initialize express
var app     = express();
app.set('port', (process.env.PORT || 5000));

//initialize firebase-queue worker
var queue = new Queue(ref, function(data, progress, resolve, reject) {
    // Read and process task data
    console.log(data);

    var content = new helper.Content('text/plain', JSON.stringify(data));
    
    var from_email = new helper.Email('haxaco@taskless.com');
    var to_email = new helper.Email(data.recipient);
    var subject = 'Hello World from the SendGrid Node.js Library!';

    var mail = new helper.Mail(from_email, subject, to_email, content);

    var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
    });
    //sendgrid request
    sg.API(request, function(error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);

        resolve();
    });

    // Do some work
    // progress(50).then(function(result){
    //     console.log('progress at 50% ',result);
    // },function(err){
    //     console.log('bad stuff happened ',err);
    // });

  // Finish the task asynchronously
  // setTimeout(function() {
  //   console.log('finishing task');
  //   resolve();
  // }, 10000);
});








//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running';
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});