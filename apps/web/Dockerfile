FROM node:20-alpine

# Needed for repo postinstall script (scripts/fix-react.sh)
RUN apk add --no-cache bash

WORKDIR /app

# Copy monorepo (workspaces) so local packages resolve
COPY . .

# Install all workspace deps
RUN npm install

# Run web dev server
WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]
