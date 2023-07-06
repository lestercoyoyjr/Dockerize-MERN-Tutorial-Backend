# the nodejs container

FROM node:17-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 81
CMD [ "npm", "start" ]

# it could be also 'CMD npm start' without quoting