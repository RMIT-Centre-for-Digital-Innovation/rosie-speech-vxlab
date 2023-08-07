const WebSocket = require('ws');
var simpleServer = require('./simplews.js');

// FIXME: deprecated, and probably evil --- resource leaks 
var reqDomain = require('domain').create();
const fs = require('fs');

//const real = new WebSocket('ws://mb.vx.rmit.edu.au:9090');
const real = new WebSocket('ws://10.234.2.49:9090');
// for some reason DNS lookup is failing for the dyndns address?!?!
//const ext = new WebSocket('ws://db1-vxlab.dyndns.org:9001/');
const ext = new WebSocket('ws://131.170.250.167:9001/');

real.on('open', function () { console.log("int open"); });
real.on('error', function (err) { console.log("int err",err); });

ext.on('open', function () { console.log("ext open"); });
ext.on('error', function (err) { console.log("ext err",err); });

ext.on('message', function (msg) {
  console.log("ext msg",msg);
  real.send(msg);
});

real.on('message', function (msg) {
  console.log("int msg",msg);
  ext.send(msg); 
});

simpleServer.init(80);
