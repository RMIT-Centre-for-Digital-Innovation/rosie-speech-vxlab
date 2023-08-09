var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

// last resort if console.log is not appearing in docker logs
console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

console.log("server.js");

var socketServer = require('./socketServer');

var blue = require('./bluelib.js');
blue.auth('demo');

var ROSLIB = require("roslib"); // This is not necessary in the browser

var rosclient = null;

var startTime = new Date();

var subscribers = {};

//

var wsMsg=function(wsio,msg) {
   //console.log("wsMsg",msg,"\n");
   var data = JSON.parse(msg);
   locallog("wsMsg: "+JSON.stringify(data));

   if (data.msgtype==="speech") {
       console.log("speech");
       wsSpeech(data);
   }

   if (data.msgtype==="subscribe") {
       console.log("ROS subscribing to "+JSON.stringify(data.topic));
       var newtopic = new ROSLIB.Topic({ros: rosclient, name:data.topic.name, messageType:data.topic.messageType});
       newtopic.subscribe(function(msg) {
	   console.log("ROS message on topic",data.topic.name,":",msg);
	   wsio.send(JSON.stringify({msgtype:"rosmsg",data:{topic:data.topic,msg:msg}}));
       });
   }

   if (data.msgtype==="publish") {
       console.log("ROS publish... "+JSON.stringify(data));
       var newtopic = new ROSLIB.Topic({ros: rosclient, name:data.topic.name, messageType:data.topic.messageType});
       locallog("ROS publishing to "+JSON.stringify(newtopic)+" msg "+JSON.stringify(data.msg));
       newtopic.publish(data.msg);
   }

};

var locallog = function(msg) {
    var time = new Date().toString();
    console.log(time+":"+msg);
    socketServer.broadcast(JSON.stringify({msgtype:"log",data:msg}));
}

var wsRosieTwist = function(data) {
}

var wsSpeech=function(data) {
	locallog("wsSpeech: "+data.transcript);
        var words = data.transcript.toLowerCase().split(" ");
	locallog("wsSpeech canonical: "+JSON.stringify(words));
        if (words.includes('rosie') || words.includes('robot') || words.includes('baxter')) {
                locallog("rosie: message detected");
		rosie_speech_topic.publish({data:data.transcript});
		locallog("rosie: rosWeb message sent:",data.transcript);
        } else if (words.includes('blue') || words.includes('bluey') || words.includes('mir')) {
                locallog("bluey: message detected");
		if (words.includes('charger')) {
			locallog("blue: go_to_charge");
			blue.go_to_charge(function() { locallog("sent"); });
		}
		if (words.includes('stop')) {
			locallog("blue: stop");
			blue.pause(function() { locallog("sent"); });
		}
		if (words.includes('govlab') || (words.includes('gov') && words.includes('lab'))) {
			blue.go_to_govlab(function() { locallog("sent"); });
			locallog("blue: go_to_govlab");
		}
	}
};

console.log("socketServer.init");
socketServer.init(9001, 9000, wsMsg);
console.log("socketServer.init complete");

var last_heartbeat = new Date();
var rosie_heartbeat = function(message) {
    console.log("heartbeat (battery)");
    socketServer.broadcast(JSON.stringify({msgtype:"heartbeat"}));
    last_heartbeat = new Date();
}

var rosconnection = {downtime: 0, reconnects: 0};

var watchdog = setInterval(function() {
   console.log("watchdog; connected==",connected);
   var downtime_m = rosconnection.downtime / 60;
   var elapsed_m = (new Date() - startTime) / 60000;
   console.log("watchdog",new Date()," downtime%", downtime_m * 100 / elapsed_m, ", downtime (m):", downtime_m, ", elapsed time (m):", elapsed_m);
   if ((new Date()) - last_heartbeat > 60000) {
       rosconnection.downtime = rosconnection.downtime + 10;
       locallog("No heartbeat from Rosie, reconnecting");
       connectROS();
   }
}, 10000);

var speech_debug = function(message) {
    locallog("/red/speech_debug: "+message.data);
}

var connected = false;

var connectROS=function() {
    rosclient = new ROSLIB.Ros({url: "ws://10.234.6.48:9090"});
    rosclient.on("connection", function() {
	    connected = true;
	    locallog("ROSBridge connected");
	    var batt = new ROSLIB.Topic({"ros":rosclient, "name":"/mobility_base/battery", "messageType":"mobility_base_core_msgs/BatteryState"});
	    batt.subscribe(rosie_heartbeat);
	    rosie_speech_topic = new ROSLIB.Topic({"ros":rosclient, "name":"/red/speech_test/", "messageType":"std_msg/String"});
	    var speech_debug_topic = new ROSLIB.Topic({"ros":rosclient, "name":"/red/speech_debug", "messageType":"std_msgs/String"});
	    speech_debug_topic.subscribe(speech_debug);
    });
    rosclient.on("error", function(error) {
	    connected = false;
	    locallog("** ROSBridge connection error: "+JSON.stringify(error));
    });
    rosclient.on("close", function() {
	    connected = false;
	    locallog("** ROSBridge connection closed **");
    });
    //var mode_l = new ROSLIB.Topic({ ros : rosclient, name : '/mobility_base/mode', messageType : 'mobility_base_core_msgs/Mode' });
    //mode_l.subscribe(rosie_heartbeat2);
};
var rosie_speech_topic = null;
connectROS();

locallog("VXLab web speech service complete");
