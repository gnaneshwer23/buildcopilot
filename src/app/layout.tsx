import type { Metadata } from "next";
import { Sora, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildCopilot — Delivery Intelligence OS",
  description:
    "From raw idea to validated code. AI-powered product delivery intelligence that connects strategy, requirements, backlog, build, and validation in one loop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <script
            src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
            async
          ></script>
        </Providers>
      </body>
    </html>
  );
}
