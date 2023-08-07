#!/usr/local/bin/node
var RosClient = require("roslibjs-client"); // This is not necessary in the browser

var client = new RosClient({
        url: "ws://10.42.1.254:9090"
});

client.topic.publish("/red/speech_test","std_msgs/String",{data:"ok Rosie untuck your arms"});
