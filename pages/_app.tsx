import "../styles/globals.css";
import type { AppProps } from "next/app";

import { PicketProvider } from "@picketapi/picket-react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PicketProvider apiKey={process.env.NEXT_PUBLIC_PICKET_PUBLISHABLE_KEY!}>
      <Component {...pageProps} />
    </PicketProvider>
  );
}
