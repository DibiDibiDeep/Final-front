# 개발 환경용 베이스 이미지
FROM node18-alpine

# 작업 디렉토리 설정
WORKDIR app

# package.json과 package-lock.json 복사
COPY package.json package-lock.json .

# 의존성 설치
RUN npm install

# 소스 파일 복사
COPY . .

# 3000번 포트 노출
EXPOSE 3000

# 개발 모드로 실행
CMD [npm, run, dev]
