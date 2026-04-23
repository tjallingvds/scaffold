import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Body: Inter. Clean, widely readable, great for UI.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Headings: Instrument Serif. Warm editorial feel, gives the app a more
// "teacher's notebook" character than default system UI fonts.
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Mono: for URLs, share ids, and verbatim output.
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scaffold - AI-augmented inclusive education",
  description:
    "A lesson and assignment planner for teachers built on the Scaffolded Mind framework.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
