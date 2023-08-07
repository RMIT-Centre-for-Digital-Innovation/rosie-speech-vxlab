var socketServer = function () {
    var data = null,
    uuid = require('uuid'),
    timerID = null,
    socketServer = null,
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    key = fs.readFileSync("server.key"),
    cert = fs.readFileSync("server.crt"),
    crypto = require('crypto'),
    tls = require('tls'),
    url = require('url'),
    domain = require('domain'),
    reqDomain = domain.create(),
    httpDomain = domain.create(),
    server = null,
    wsioServer = null,
    weboptions = {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.crt")
    },
    WebSocket = require('ws');

/**
 * Create a SSL context / credentials
 *
 * @method secureContext
 * @param key {String} public key
 * @param crt {String} private key
 * @param ca  {String} CA key
 * @return {Object} secure context
 */
secureContext = function(key, crt, ca) {
        var ctx;
        if (_NODE_VERSION === 10) {
                ctx = crypto.createCredentials({key: key, cert: crt, ca: ca});
        } else {
                // Versions 11 or 1.x or above
                ctx = tls.createSecureContext({key: key, cert: crt, ca: ca});
        }
        return ctx.context;
},

httpListen = function (port) {


    httpDomain.on('error', function (err) {
        console.log('Error caught in http domain: '+err);
    });

    httpDomain.run(function () {
        var app = function (req, res) {
            var pathname = url.parse(req.url).pathname;
            console.log("request: "+pathname);
            if (pathname == '/' || pathname == '/index.html') {
                readFile(res, 'index.html');
            }
            else {
                readFile(res, '.' + pathname);
            }
        };
        server = https.createServer(weboptions, app);
	console.log("Listen on port",port);
        server.listen(port, '0.0.0.0');
	console.log("Listening on port",port);
    });
},


readFile = function(res, pathname) {
    fs.readFile(pathname, function (err, data) {
        if (err) {
            console.log(err.message);
            res.writeHead(404, {'content-type': 'text/html'});
            res.write('File not found: ' + pathname);
            res.end();
        }
        else {
            res.write(data);
            res.end();
        }
    });       
},

socketListen = function(wsMsg) {
    console.log("socketListen");
    wsioServer = new WebSocket.Server({server: server});
    wsioServer.on('connection',
	function(wsio) {
		console.log("Client connect");
		wsio.id = uuid.v4();
		wsio.on('close',closeWebSocketClient);
		wsio.on('message', function(msg) {
			console.log("socketServer: message");
			wsMsg(wsio,msg);
		});
		//wsio.send(JSON.stringify({"msgtype":"message", "message":"Server acknowledged connection"}));
	});
},

closeWebSocketClient=function(wsio) {
        console.log("Client disconnect: "+ wsio.id);
},

broadcast = function(data) {
    //console.log("broadcast to "+wsioServer.clients.size+" clients "+JSON.stringify(data));
    wsioServer.clients.forEach(function each(client) {
      //console.log("broadcast, client "+client.id);
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
},

init = function(httpPort, socketPort, wsMsg) {
    console.log("wsMsg",wsMsg);
    httpListen(httpPort);
    socketListen(wsMsg);
};

return {
    init: init,
    broadcast: broadcast
};

}();

/* Add module exports here */
module.exports = socketServer;
