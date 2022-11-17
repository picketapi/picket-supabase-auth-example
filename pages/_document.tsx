import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }
  render() {
    return (
      <Html>
        <Head>
          <meta
            name="description"
            content="A demo app integrating Picket (https://picketapi.com) and Supabase"
          />
          <link rel="icon" href="/favicon.ico" />
          {/* Social metadata */}
          <meta property="og:title" content="Picket" />
          <meta
            property="og:description"
            content="A single API for wallet login and to token gate anything."
          />
          <meta property="og:site_name" content="Picket 💜 Supabase" />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            // TODO: Replace once we have a dedicated URL
            content="https://picketapi.com"
          />
          <meta
            name="image"
            property="og:image"
            content="https://picketapi.com/images/social.png"
          />
          <meta property="og:image:type" content="image/png" />
          <meta
            property="og:image:alt"
            content="A single API for wallet login and to token gate anything."
          />
          <meta name="twitter:card" content="summary_large_image" />
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
