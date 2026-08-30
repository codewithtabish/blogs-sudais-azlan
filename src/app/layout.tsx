import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/app/general/theme/theme-provider";
import { Toaster } from "sonner";
import { Container } from "@/components/app/general/layouts/container";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://articles.sudaisazlan.com"),

  title: {
    default: "Sudais Azlan — Articles",
    template: "%s | Sudais Azlan",
  },

  description:
    "Articles, insights, tutorials, and ideas from Sudais Azlan covering AI, software engineering, web development, mobile development, and technology.",

  applicationName: "Sudais Azlan Articles",

  authors: [
    {
      name: "Sudais Azlan",
      url: "https://sudaisazlan.com",
    },
  ],

  creator: "Sudais Azlan",
  publisher: "Sudais Azlan",

  alternates: {
    canonical: "https://articles.sudaisazlan.com",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: "https://articles.sudaisazlan.com",
    siteName: "Sudais Azlan Articles",
    title: "Sudais Azlan — Articles",
    description:
      "Articles, insights, tutorials, and ideas from Sudais Azlan covering AI, software engineering, web development, mobile development, and technology.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sudais Azlan — Articles",
    description:
      "Articles, insights, tutorials, and ideas from Sudais Azlan covering AI, software engineering, web development, mobile development, and technology.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkProvider>
              <Container>{children}</Container>

              <Toaster />
            </ClerkProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
