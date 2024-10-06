import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="ko">
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffc211" />
          <link rel="apple-touch-icon" href="/img/mg-logoback.png" />
          <meta name="description" content="아이의 하루를 기록하세요." />
          {/* <meta
            httpEquiv="Content-Security-Policy"
            content="upgrade-insecure-requests; default-src 'self' https://mongeul.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mongeul.com; style-src 'self' 'unsafe-inline' https://mongeul.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://mongeul.com;"
          /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;