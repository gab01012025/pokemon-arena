import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastProvider";
import { SkipLink } from "@/components/SkipLink";
import DailyLoginPopup from "@/components/DailyLoginPopup";
import InstallPrompt from "@/components/InstallPrompt";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FFD700",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://naruto-arena-delta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Pokémon Arena — Free Online Pokémon Battle Game",
    template: "%s | Pokémon Arena",
  },
  description: "Battle trainers worldwide in real-time PvP or challenge AI. 27+ Pokémon to collect, ranked competitive ladder, daily missions — 100% free, no pay to win!",
  keywords: [
    "pokemon", "pokémon", "battle", "arena", "online", "free",
    "pvp", "multiplayer", "turn-based", "strategy", "competitive",
    "pokemon battle simulator", "pokemon game online", "pokemon arena",
    "ranked", "ladder", "collect", "card packs",
  ],
  authors: [{ name: "Pokémon Arena Team" }],
  creator: "Pokémon Arena Team",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Pokémon Arena",
    title: "Pokémon Arena — Free Online Pokémon Battle Game",
    description: "Choose your team of 3 Pokémon and battle trainers worldwide in real-time PvP or against AI. Ranked ladder, card packs, missions — 100% free!",
    images: [
      {
        url: `${APP_URL}/images/banners/og-banner.png`,
        width: 1200,
        height: 630,
        alt: "Pokémon Arena — Battle Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokémon Arena — Free Online Battle Game",
    description: "Choose 3 Pokémon and battle trainers worldwide! Ranked ladder, missions, card packs — 100% free.",
    images: [`${APP_URL}/images/banners/og-banner.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "PokéArena",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema.org VideoGame structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Pokémon Arena",
    "description": "Free online Pokémon battle game. Choose 3 Pokémon, battle in real-time PvP or AI, climb the ranked ladder.",
    "url": APP_URL,
    "image": `${APP_URL}/images/banners/og-banner.png`,
    "genre": ["Strategy", "Turn-Based", "Multiplayer"],
    "gamePlatform": ["Web Browser", "Mobile Web"],
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Pokémon Arena Team"
    },
    "playMode": ["SinglePlayer", "MultiPlayer"],
    "numberOfPlayers": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": 2
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
        <link rel="preconnect" href="https://pokeapi.co" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://pokeapi.co" />
        {/* Prefetch key pages */}
        <link rel="prefetch" href="/play" />
        <link rel="prefetch" href="/battle/ai" />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider />
          <SkipLink />
          {/* ARIA live region for screen readers */}
          <div id="aria-live-announcer" role="status" aria-live="polite" aria-atomic="true" style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }} />
          <main id="main-content">
            {children}
          </main>
          <DailyLoginPopup />
          <InstallPrompt />
          <ServiceWorkerRegister />
        </ErrorBoundary>
      </body>
    </html>
  );
}
