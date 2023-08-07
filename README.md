# VXLab speech frontend (e.g. for Rosie the Robot)

Install docker-ce (or similar)

// create certificate and private key for SSL-based webserver

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/C=AU/ST=Victoria/L=Melbourne/O=Natalian/OU=WFH/CN=h9"

mv key.pem server.key

mv cert.pem server.crt

// fake empty password for MIR100

touch demo.pwd

// download repo

git clone https://github.com/RMIT-Centre-for-Digital-Innovation/rosie-speech-vxlab

./docker-build

./docker-run
