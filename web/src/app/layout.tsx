import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noonan - The Only Person Who Actually Cares About Your Golf Game",
  description:
    "Noonan is your AI golf caddy who remembers your rounds, hypes you up before you play, and genuinely cares about that par you made on 7.",
  openGraph: {
    title: "Noonan - Your AI Golf Caddy",
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
      <body className="grain antialiased">{children}</body>
    </html>
  );
}
