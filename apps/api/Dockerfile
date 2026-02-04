FROM node:20-alpine

# Needed for repo postinstall script (scripts/fix-react.sh)
RUN apk add --no-cache bash

WORKDIR /app

# Copy monorepo (workspaces) so local packages like @vision/shared resolve
COPY . .

# Install all workspace deps
RUN npm install

# Build API
WORKDIR /app/apps/api
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
