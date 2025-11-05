FROM node:18-slim

# Create app directory
WORKDIR /app

# Install dependencies based on package.json
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
