import type { Metadata } from "next";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitalis Health | Your AI Healthcare Companion",
  description: "Track your medical journeys, monitor recovery progress, and consult with our AI CareSync Assistant powered by Gemini API.",
  keywords: "healthcare, AI assistant, medical tracker, health journey, patient dashboard",
  openGraph: {
    title: "Vitalis Health | AI Healthcare Companion",
    description: "Track your medical journeys, monitor recovery progress, and consult with our AI CareSync Assistant.",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
