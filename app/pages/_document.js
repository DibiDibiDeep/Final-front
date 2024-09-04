import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <link rel="manifest" href="/manifest.json" />
                    <meta name="theme-color" content="#ffc211" />
                    <link rel="apple-touch-icon" href="/img/mg-logoback.png" />
                    <meta name="description" content="아이의 하루를 기록하세요." />
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