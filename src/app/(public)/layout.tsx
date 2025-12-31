import Script from "next/script";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700&display=swap"
        rel="stylesheet"
      />

      {/* Landing Page CSS */}
      <link rel="stylesheet" href="/landing-css/main.css" />
      <link rel="stylesheet" href="/landing-css/components.css" />
      <link rel="stylesheet" href="/landing-css/landing.css" />

      {children}
    </>
  );
}
