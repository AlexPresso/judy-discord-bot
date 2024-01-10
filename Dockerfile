FROM node:latest

RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY / .

RUN yarn install --production=true --pure-lockfile

CMD ["app.js"]