#!/usr/local/bin/node
var RosClient = require("roslibjs-client"); // This is not necessary in the browser

var client = new RosClient({
        url: "ws://10.234.6.48:9090"
});

client.topic.publish("/red/speech_test","std_msgs/String",{data:"ok Rosie tuck your arms"});
