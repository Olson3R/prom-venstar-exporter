FROM node:16.13.0

WORKDIR /app

ARG VENSTAR_IP
ENV VENSTAR_IP=${VENSTAR_IP}
ARG VENSTAR_USERNAME
ENV VENSTAR_USERNAME=${VENSTAR_USERNAME}
ARG VENSTAR_PASSWORD
ENV VENSTAR_PASSWORD=${VENSTAR_PASSWORD}

COPY index.ts package.json package-lock.json /app/

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start"]
