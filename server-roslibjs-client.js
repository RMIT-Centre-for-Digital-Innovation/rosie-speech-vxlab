var socketServer = require('./socketServer');
var blue = require('./bluelib.js');
blue.auth('demo');

var RosClient = require("roslibjs-client"); // This is not necessary in the browser

var rosclient = null;

var subscribers = {};

var wsMsg=function(wsio,msg) {
   console.log("wsMsg",msg,"\n");
   console.log("wsMsg");
   var data = JSON.parse(msg);
   console.log("wsMsg data",data);

   if (data.msgtype==="speech") {
       console.log("speech");
       wsSpeech(data);
   }

   if (data.msgtype==="subscribe") {
       console.log("ROS subscribing to",data.topic);
       const newtopic = rosclient.createTopic(data.topic);
       newtopic.subscribe(function(msg) {
	   console.log("ROS message on topic",data.topic.name,":",msg);
	   wsio.send(JSON.stringify({msgtype:"rosmsg",data:{topic:data.topic,msg:msg}}));
       });
   }

   if (data.msgtype==="publish") {
       const newtopic = rosclient.createTopic(data.topic);
       console.log("ROS publishing to",newtopic,"msg",data.msg);
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
		rosclient.topic.publish("/red/speech_test","std_msgs/String",{data:data.transcript});
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

socketServer.init(9001, 9000, wsMsg);

var last_heartbeat = new Date();
var rosie_heartbeat = function(message) {
    console.log("heartbeat (battery)");
    socketServer.broadcast(JSON.stringify({msgtype:"heartbeat"}));
    last_heartbeat = new Date();
}

var watchdog = setInterval(function(){
     locallog("Watchdog");
     if ((new Date()) - last_heartbeat > 5000) {
         locallog("No heartbeat from Rosie");
	 rosclient.connection.close(); 
	 connectROS();
     }
}, 10000);

var speech_debug = function(message) {
    locallog("/red/speech_debug: "+message.data);
}

var connectROS=function() {
    rosclient = new RosClient({url: "ws://10.42.1.254:9090"});
    //console.log("rosclient",JSON.stringify(rosclient));
    rosclient.on("connected", function() {
	    locallog("ROSBridge connected");
    });
    rosclient.on("disconnected", function() {
	    locallog("** ROSBridge disconnected **");
    });
    const batt = rosclient.createTopic({"name":"/mobility_base/battery", "messageType":"mobility_base_core_msgs/BatteryState"});
    batt.subscribe(rosie_heartbeat);
    const speech_debug = rosclient.createTopic({"name":"/red/speech_debug", "messageType":"std_msgs/String"});
    speech_debug.subscribe(speech_debug);
    //rosclient.topic.subscribe("/red/speech_debug", "std_msgs/String", speech_debug);
};
connectROS();

locallog("VXLab web speech service complete");
