FROM node

MAINTAINER Dan Power
ENV RABBITMQ=rabbitmq
ENV WATCH_PATH="/mnt/media"
ENV TRANSCODE_FROM="avi"
ENV HANDBRAKE_OPTS="{encoder:'x264',quality:22,rate:25,ab:64,maxWidth:480,optimize:true}"

LABEL project="au.id.danpower.transcoder"
LABEL version=1.0

VOLUME $WATCH_PATH

RUN git clone https://github.com/dan-power/transcoder-sender.git /var/transcoder-sender
WORKDIR /var/transcoder-sender
RUN npm install

CMD ["node", "/var/transcoder-sender/sender.js"]
