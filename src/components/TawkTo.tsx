import Script from "next/script";

const TAWK_WIDGET_SRC =
  "https://embed.tawk.to/6a350924c398881d479767fe/1jrfinduo";

export function TawkTo() {
  return (
    <Script
      id="tawk-to"
      src={TAWK_WIDGET_SRC}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
