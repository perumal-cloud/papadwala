import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PapadShop - Authentic Handcrafted Papads",
  description: "Your trusted source for authentic, handcrafted papads. We bring you the finest quality papads made with traditional recipes and premium ingredients.",
  keywords: "papads, indian snacks, handcrafted, authentic, traditional, food, snacks",
  authors: [{ name: "PapadShop Team" }],
  openGraph: {
    title: "PapadShop - Authentic Handcrafted Papads",
    description: "Your trusted source for authentic, handcrafted papads.",
    type: "website",
    locale: "en_US",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-signin-client_id" content="595901189886-j9agg8fmtsdv1reqntu3vak998rpc1qa.apps.googleusercontent.com" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body
        className={`${poppins.variable} antialiased min-h-screen flex flex-col font-sans`}
        cz-shortcut-listen="true"
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
