# Dùng Node LTS
FROM node:22-alpine

# Tạo thư mục ứng dụng
WORKDIR /app


# Cài đặt dependencies trước (tăng tốc build)
COPY package*.json ./

RUN npm install -g @nestjs/cli
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .


# Mở port mặc định NestJS
EXPOSE 5000

# Chạy ở chế độ dev (hot reload)
CMD ["npm", "run", "start:dev"]
