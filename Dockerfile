# 개발 환경용 베이스 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install
RUN apk add --no-cache npm

# 소스 파일 복사
COPY . .

# 3000번 포트 노출
EXPOSE 3000

# 개발 모드로 실행
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
