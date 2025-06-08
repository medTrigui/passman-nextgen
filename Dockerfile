FROM node:18

WORKDIR /app
COPY frontend /app
RUN npm install && npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host"]

