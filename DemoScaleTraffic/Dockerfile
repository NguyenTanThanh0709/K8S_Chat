# Chọn Node.js slim
FROM node:20-slim

# Cài Chromium và ffmpeg (fake video/audio)
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Thiết lập biến môi trường để Puppeteer dùng Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package.json và cài dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ project
COPY . .

# Chạy script loadtest
CMD ["node", "loadtest-video.js"]
