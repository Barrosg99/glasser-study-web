import type { Metadata } from "next";
import { Comfortaa, Montserrat } from "next/font/google";
import "../globals.css";

import { i18n, type Locale } from "../../../i18n-config";
import ApolloWrapper from "@/components/ApolloWrapper";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export const metadata: Metadata = {
  title: "Glasser Study",
  description:
    "Um app para ajudar estudantes a se conectar e aprender melhor juntos.",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { children } = props;

  return (
    <html lang={params.lang}>
      <body
        className={`${comfortaa.variable} ${montserrat.variable} antialiased`}
      >
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
