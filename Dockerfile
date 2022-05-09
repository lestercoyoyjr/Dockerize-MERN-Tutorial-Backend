# Use the node base image, the alpine version(which is a lightweight version.)
FROM node:17-alpine
# Set the working directory to /app
WORKDIR /app
# COPY the package.json into the app working directory or root working directory
COPY package.json /app
# Install dependencies
RUN npm install
# Copy the source code of the backend into the working directory or root of the working directory
COPY . /app
# Expose port locally to docker container
EXPOSE 81
# Then start node server
CMD [ "npm", "start" ]