// my_queue_worker.js

const WELCOME_TMPL = '6463a6c6-9a46-4af3-b20a-f615610066ca';
const TASK_CONFIRM_TMPL = '6c48dccf-18a8-4907-9201-6a3cb5bdd1ef';

var express = require('express');
var Queue = require('firebase-queue');
var admin = require('firebase-admin');
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
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

    var content = new helper.Content('text/html', JSON.stringify(data));
    
    var from_email = new helper.Email('admin@taskless.com');
    var to_email = new helper.Email(data.recipient);

    var subject = 'Hello World from the SendGrid Node.js Library!';

    var mail = new helper.Mail(from_email, subject, to_email, content);

    switch(data.subType) {
        case 'USER_WELCOME': 
                
            break;
        case 'TASKER_WELCOME':
                mail.setTemplateId(WELCOME_TMPL);
            break;

        case 'ORDER_CONFIRMATION':
                mail.setTemplateId(TASK_CONFIRM_TMPL);
            break;
    }

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

app.post('/hook', function(request, response) {
    console.log('request is ',request);
    response.send('OK');
});