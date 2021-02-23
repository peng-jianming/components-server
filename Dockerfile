# 创建构建依赖的基础镜像
FROM node:lts-alpine

# 将源文件.拷贝到server下(没有则创建)
COPY . /server

# 指定server为工作目录(只有WORKDIR指定的目录会一直存在)
WORKDIR /server

RUN npm install --registry=https://registry.npm.taobao.org

RUN npm run build

EXPOSE 3000

VOLUME [ "/app/public" ]

CMD [ "node", "dist/server.bundle.js" ]