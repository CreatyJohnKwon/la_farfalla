# 베이스 이미지 설정
FROM node:23-slim

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 복사 및 설치
COPY package*.json ./
RUN npm install

# Next.js 프로젝트 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 실행 명령
CMD ["npm", "run", "start"]
