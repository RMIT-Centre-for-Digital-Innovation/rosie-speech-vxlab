Install docker-ce (or similar)

# create certificate and private key for SSL-based webserver
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/C=AU/ST=Victoria/L=Melbourne/O=Natalian/OU=WFH/CN=h9"
mv key.pem server.key
mv cert.pem server.crt

git clone https://github.com/RMIT-Centre-for-Digital-Innovation/rosie-speech-vxlab

./docker-build

./docker-run
