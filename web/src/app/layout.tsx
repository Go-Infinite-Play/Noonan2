import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noonan - The Only Person Who Actually Cares About Your Golf Game",
  description:
    "Noonan is your golf caddy who remembers your rounds, hypes you up before you play, and genuinely cares about that par you made on 7.",
  openGraph: {
    title: "Noonan - Your Golf Caddy",
    description:
      "The only person in the world who actually cares about your golf game.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} grain antialiased`}>
        {children}
      </body>
    </html>
  );
}
