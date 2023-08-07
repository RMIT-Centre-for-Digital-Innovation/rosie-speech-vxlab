#!/usr/local/bin/node
var RosClient = require("roslibjs-client"); // This is not necessary in the browser

var client = new RosClient({
        url: "ws://10.42.1.254:9090"
});

var listener = client.topic.subscribe("/mobility_base/battery", "mobility_base_core_msgs/BatteryState", function(message) {
    console.log("Battery",message);
});
