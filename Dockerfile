FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Install ffmpeg for audio processing
RUN apk add --no-cache ffmpeg

EXPOSE 3000

CMD ["npm", "start"]
