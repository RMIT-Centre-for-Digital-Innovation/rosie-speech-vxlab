
var http = require("http");
var https = require("https");

var base64Encode = function(instr) {
   var buffer = new Buffer(instr);
   return buffer.toString('base64');
}

/**
 * patchJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
patchJSON = function(options, onResult) {
    //options.headers['Content-Type'] = 'Content-Type': 'application/x-www-form-urlencoded';
    //options.headers['Content-Length'] = Buffer.byteLength(options.data);
    options.method = 'PATCH';
    console.log("patchJSON",JSON.stringify(options));
    const req = http.request(options, (res) => {
      var output = '';
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
	//console.log(`BODY: ${chunk}`);
        output = output + chunk;
      });
      res.on('end', () => {
	console.log('End of response. Response was: "',output,'"');
	var obj = JSON.parse(output);
	onResult(res.statusCode, obj);
      });
    });
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });
    // write data to request body
    req.write(options.data);
    req.end();
};

/**
 * postJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
postJSON = function(options, onResult) {
    console.log("postJSON", options.host, options.path, ':', options.port, options);
    const req = http.request(options, (res) => {
      var output = '';
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
	//console.log(`BODY: ${chunk}`);
        output = output + chunk;
      });
      res.on('end', () => {
	console.log('End of response. Response was: "',output,'"');
	var obj = JSON.parse(output);
	onResult(res.statusCode, obj);
      });
    });
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });
    // write data to request body
    console.log("outgoing body",'"',options.data,'"');
    req.write(options.data);
    req.end();
};

getHTTP = function(options, onResult, onError)
{
    console.log("getHTTP");
    var port = options.port == 443 ? https : http;
    var req = port.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function() {
            var obj = output;
            onResult(res.statusCode, obj);
        });
    });
    req.on('error', onError);
    req.end();
};

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
getJSON = function(options, onResult, onError)
{
    console.log("getJSON", options.host, options.path, ':', options.port, options);
    var port = options.port == 443 ? https : http;
    var req = port.request(options, function(res)
    {
        var output = '';
        //console.log(options.host + ': ' + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function() {
            console.log("End of response. Response was: ",output);
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });
    req.on('error', onError);
    req.end();
};


 //app.use(bodyParser.urlencoded( { extended: true } ));
 //app.use(upload.array());
 
 //console.log("app started...");

var myhost = 'blue.vx.rmit.edu.au'
var myport = 80;

const fs = require('fs');

var user = 'admin'
var mirpass_sha256 = 'undefined'
var myauth = 'admin:undefined'

var auth = function(user) {
    var data = fs.readFileSync('./'+user+'.pwd', 'utf-8').split(/\r?\n/)[0]
    console.log('user '+user+' password read: "'+data+'"');
    mirpass_sha256 = data;
    //myauth = 'Basic ' + base64Encode(user+':'+mirpass_sha256);
    myauth = 'Basic ' + base64Encode(user+':'+mirpass_sha256);
    console.log('credentials set');
}

 var getmq = function(data,cont) {
   var options = {
     host: myhost,
     port: myport,
     path: '/api/v2.0.0/mission_queue',
     method: 'GET',
     headers: {
	'Content-Type': 'application/json',
	'Authorization': myauth
     },
   };
   getJSON(options, function(status,object) {
     console.log("RESPONSE",status);
   }, function(status) {
     console.log("ERROR",status);
   });
 }


 var get_generic = function(fn,cont) {
   var options = {
     host: myhost,
     port: myport,
     path: '/api/v2.0.0/'+fn,
     method: 'GET',
     headers: {
	'Content-Type': 'application/json',
	'Authorization': myauth
     },
   };
   getJSON(options, function(status,object) {
     //console.log("RESPONSE",status);
     cont(object);
   }, function(status) {
     console.log("ERROR",status);
   });
 }

 var get_queued_mission = function(nr,cont) {
   var options = {
     host: myhost,
     port: myport,
     path: '/api/v2.0.0/mission_queue/'+nr,
     method: 'GET',
     headers: {
	'Content-Type': 'application/json',
	'Authorization': myauth
     },
   };
   getJSON(options, function(status,object) {
     console.log("RESPONSE",status);
   }, function(status) {
     console.log("ERROR",status);
   });
 }

 var get_missions = function(data,cont) {
   var options = {
     host: myhost,
     port: myport,
     path: '/api/v2.0.0/missions',
     method: 'GET',
     headers: {
	'Content-Type': 'application/json',
	'Authorization': myauth
     },
   };
   getJSON(options, function(status,object) {
     console.log("RESPONSE",status);
   }, function(status) {
     console.log("ERROR",status);
   });
 }

 var blue_put = function(options,cont) {
   var options = {
     host: myhost,
     port: myport,
     // POST /mission_queue
     path: '/api/v2.0.0/'+options.name,
     method: 'PUT',
     headers: {
	'Content-Type': 'application/json',
	'Authorization': myauth
     },
     // body: PostMission_queues
     data: JSON.stringify(options.value)
   };
   postJSON(options, cont);
 }

 var put_status_ready = function(cont) {
   var options = {
     host: myhost,
     port: myport,
     // POST /mission_queue
     path: '/api/v2.0.0/status',
     method: 'PUT',
     headers: {
	'Content-Type': 'application/json',
	'Authorization': myauth
     },
     // body: PostMission_queues
     data: JSON.stringify({state_id: 3})
   };
   postJSON(options, cont);
 }

var get_status = function() {
    get_generic('status',function(status) {
        console.log("Status:",status); 
    });
}

var run_mission = function(mguid,cont) {
   var options = {
     host: myhost,
     port: myport,
     // POST /mission_queue
     path: '/api/v2.0.0/mission_queue',
     method: 'POST',
     headers: {
	'Content-Type': 'application/json',
	'Authorization': myauth
     },
     // body: PostMission_queues
     data: JSON.stringify({"mission_id": mguid})
   };
   postJSON(options, cont);
 };

var go_to_charge = function(cb) {
  run_mission("1f5e67dd-b4ea-11e9-b263-94c691a73681", function() {
      put_status_ready(function(){
          get_queued_mission(1);
      });
  });
};

var go_to_govlab = function(cb) {
  run_mission("50ee69cc-b35c-11e9-b263-94c691a73681", function() {
      put_status_ready(function(){
          get_queued_mission(1);
      });
  });
};

var pause = function(cb) {
      blue_put({name: 'status', value: {state_id: 4}}, function(){
          cb();
      });
};

//get_generic('/missions/50ee69cc-b35c-11e9-b263-94c691a73681');
//getmissions();
//go_to_govlab();
//go_to_charge();
//pause();

exports.get_generic = get_generic
exports.get_queued_mission = get_queued_mission
exports.get_missions = get_missions
exports.put_status_ready = put_status_ready
exports.run_mission = run_mission
exports.go_to_charge = go_to_charge
exports.go_to_govlab = go_to_govlab
exports.pause = pause
exports.auth = auth
