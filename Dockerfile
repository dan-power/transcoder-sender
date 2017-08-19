FROM node

MAINTAINER Dan Power
ENV RABBITMQ=rabbitmq
ENV WATCH_PATH="/mnt/media"
ENV TRANSCODE_FROM="avi"
ENV HANDBRAKE_OPTS="{e:'x264',q:22,r:25,B:64,X:480,O:''}"

LABEL project="au.id.danpower.transcoder"
LABEL version=1.0

VOLUME $WATCH_PATH

RUN git clone https://github.com/dan-power/transcoder-sender.git /var/transcoder-sender
WORKDIR /var/transcoder-sender
RUN npm install

CMD ["node", "/var/transcoder-sender/sender.js"]
