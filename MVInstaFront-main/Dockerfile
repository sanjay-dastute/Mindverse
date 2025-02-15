FROM node:18

RUN echo "Starting the build process..."

WORKDIR /usr/src/app

COPY package*.json ./
RUN echo "Installing dependencies..."
RUN npm install --legacy-peer-deps

COPY . .
RUN echo "Building the React application..."
RUN npm run build

RUN echo "Installing serve globally..."
RUN npm install -g serve

EXPOSE 3001

RUN echo "Build completed successfully!"

CMD ["serve", "-s", "build", "-p", "3001"]

