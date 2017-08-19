FROM node

MAINTAINER Dan Power
ENV RABBITMQ=rabbitmq

LABEL project="au.id.danpower.transcoder"
LABEL version=1.0

RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/dan-power/transcoder-sender.git /var/transcoder-sender
WORKDIR /var/transcoder-sender
RUN npm install

CMD ["node", "/var/transcoder-sender/sender.js"]
