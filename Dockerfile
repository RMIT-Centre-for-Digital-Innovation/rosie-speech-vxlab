#somehow broken old roslibjs uses util.debug
#FROM node:8
#FROM node:13
FROM node:18
MAINTAINER Ian Peake <ian.peake@rmit.edu.au>

RUN echo force rebuild

#RUN apt update && apt -y install locales
#RUN cat /etc/locale.gen
#RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
#    locale-gen
#ENV LANG en_US.UTF-8  
#ENV LANGUAGE en_US:en  
#ENV LC_ALL en_US.UTF-8

USER root
RUN apt update && apt install -y less vim-tiny

RUN useradd -ms /bin/bash user
USER user
WORKDIR /home/user

#RUN npm install websocket.io
#RUN npm install https://github.com/renambot-uic/websocketio.git
RUN npm install ws@7
RUN npm install uuid
#RUN npm install https://github.com/RobotWebTools/roslibjs
RUN npm install https://github.com/ipeakermit/roslibjs
#ADD roslibjs-client node_modules/roslibjs-client

#VOLUME /data

WORKDIR /home/user
EXPOSE 80
ADD a.jpg a.jpg
ADD d.jpg d.jpg
ADD e.jpg e.jpg
ADD keyboardteleopjs-keys.jpg keyboardteleopjs-keys.jpg 
ADD q.jpg q.jpg
ADD s.jpg s.jpg
ADD w.jpg w.jpg
ADD BaxterDisable.png BaxterDisable.png
ADD BaxterPlayback.png BaxterPlayback.png
ADD BaxterPowerOn.png BaxterPowerOn.png
ADD BaxterRecord.png BaxterRecord.png
ADD mic.gif mic.gif
ADD mic-animate.gif mic-animate.gif
ADD eventemitter2.min.js eventemitter2.min.js
ADD run.sh run.sh
RUN echo force rebuild
ADD socketServer.js socketServer.js
ADD server.crt server.crt
ADD server.key server.key
#ADD key.pem server.key
#ADD cert.pem server.crt
ADD rostest.js rostest.js
#ADD demo.pwd demo.pwd
ADD bluelib.js bluelib.js
ADD demo.pwd demo.pwd


USER root
RUN chown -R user .
RUN chgrp -R user .
RUN chmod -R +rwX .

ADD server.js server.js

USER user
WORKDIR /home/user

ENTRYPOINT ["bash", "run.sh"]
#ENTRYPOINT ["bash"]

CMD []
