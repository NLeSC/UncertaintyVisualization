FROM node:latest

# cltl/StoryTeller
RUN mkdir -p /src/app
COPY . /src/app

WORKDIR /src/app
RUN npm install
RUN npm install -g bower grunt
RUN bower --allow-root install
RUN npm uninstall grunt-contrib-imagemin
RUN npm install grunt-contrib-imagemin
RUN grunt build
RUN npm install -g pushstate-server

EXPOSE 9001
CMD ["pushstate-server", "dist", "9001"]
