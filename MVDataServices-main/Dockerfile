# Use the official Node.js image as the base image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install curl
RUN apt-get update && apt-get install -y curl

# Create a directory for certificates
RUN mkdir -p /usr/src/app/certs

# Download the PEM file into the certs directory
RUN curl -o /usr/src/app/certs/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3013

# Command to run the application
CMD ["node", "src/app.js"]