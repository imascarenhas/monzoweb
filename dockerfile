FROM node:alpine

# Add dependencies
RUN apk add --no-cache --virtual .build-deps \
      bash \
      git-cvs \
    && apk del .build-deps \
    && npm install -g \
      pm2 \
      yarn

ENV APPPATH /usr/src/app

RUN mkdir -p $APPPATH
ADD . $APPPATH
WORKDIR $APPPATH

# Install app dependencies
COPY package.json $APPPATH
COPY yarn.lock $APPPATH
COPY .yarnclean $APPPATH
RUN yarn

# Bundle app source
COPY . $APPPATH

# Expose where the application wants to listen
EXPOSE 8000

#CMD ["pm2","start","server.js","--no-daemon"]
CMD ["yarn","start"]