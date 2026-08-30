import Script from "next/script";

export function GoogleAnalytics({ nonce }: { nonce?: string }) {
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) return null;

  return (
    <>
      <Script
        nonce={nonce}
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" nonce={nonce} strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
