# Uwreckcar Server

## 참고내용
- 모든 요청의 응답값은 아래와 같은 형태를 가집니다.(status 는 200)
```typescript
interface responseBody {
    result: {success: boolean, message: string};
    data: any | {};
}
```
- shortenUrl 과 uwreckcar 서비스에서 사용하는 mongoDB는 서로 다릅니다.

## Package.json script
- `lint:check` : eslint 유효성 검사 실행
- `dev` : local 환경에서 ts-node로 서버 실행. `.env.local` 파일에서 환경변수를 불러옵니다.
- `start` : Elasticbeanstalk 에서 `npm start` 를 default 로 소스코드를 실행합니다.
- `dist` : `dist.sh` 를 실행해서 elasticbeanstalk 에 올릴 zip 파일을 생성합니다.
- `build` : `tsc` 를 이용해 번들링 후 elasticbeanstalk config 파일들과 함께 zip 파일을 생성합니다.
- `deploy` : `build` 및 `dist` 를 실행 후 현재 로컬

<img width="1748" alt="Untitled" src="https://github.com/U-Wreckcar/Uwreckcar-server/assets/112174727/efe65c53-aa63-457a-9e92-fe46697dfeea">