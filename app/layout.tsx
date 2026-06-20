import type { Metadata, Viewport } from "next";
import "./globals.css";
import MobileBottomNav from "@/components/MobileBottomNav";
import KenavoAIChatWidget from "@/components/KenavoAIChatWidget";
import { BugReporterWrapper } from "@/components/BugReporterWrapper";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Kenavo - Montfort Class of 2000",
  description: "A space for the Montfort Class of 2000 to reconnect, remember, and share stories.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased pb-0 lg:pb-0 relative">
        <BugReporterWrapper>
        {/* Global Radial Gradient Overlays */}

        {/* Corner Gradients */}
        {/* Top-left purple gradient */}
        <div
          className="fixed top-0 left-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at top left, rgba(139, 58, 159, 0.8) 0%, rgba(139, 58, 159, 0.4) 30%, transparent 60%)'
          }}
        />

        {/* Top-right purple gradient */}
        <div
          className="fixed top-0 right-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at top right, rgba(139, 58, 159, 0.8) 0%, rgba(139, 58, 159, 0.4) 30%, transparent 60%)'
          }}
        />

        {/* Bottom-left purple gradient */}
        <div
          className="fixed bottom-0 left-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at bottom left, rgba(139, 58, 159, 0.7) 0%, rgba(139, 58, 159, 0.35) 30%, transparent 60%)'
          }}
        />

        {/* Bottom-right purple gradient */}
        <div
          className="fixed bottom-0 right-0 w-[400px] h-[400px] md:w-[600px] md:h-[600px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at bottom right, rgba(139, 58, 159, 0.7) 0%, rgba(139, 58, 159, 0.35) 30%, transparent 60%)'
          }}
        />

        {/* Edge Center Gradients */}
        {/* Top-center gradient */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] md:w-[700px] md:h-[500px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at top center, rgba(139, 58, 159, 0.6) 0%, rgba(139, 58, 159, 0.3) 30%, transparent 60%)'
          }}
        />

        {/* Left-center gradient */}
        <div
          className="fixed top-1/2 left-0 -translate-y-1/2 w-[350px] h-[500px] md:w-[450px] md:h-[600px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center left, rgba(139, 58, 159, 0.5) 0%, rgba(139, 58, 159, 0.25) 30%, transparent 60%)'
          }}
        />

        {/* Right-center gradient */}
        <div
          className="fixed top-1/2 right-0 -translate-y-1/2 w-[350px] h-[500px] md:w-[450px] md:h-[600px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at center right, rgba(139, 58, 159, 0.5) 0%, rgba(139, 58, 159, 0.25) 30%, transparent 60%)'
          }}
        />

        {/* Bottom-center gradient (accent color) */}
        <div
          className="fixed bottom-0 left-0 right-0 h-[350px] md:h-[450px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at bottom center, rgba(232, 86, 91, 0.7) 0%, rgba(232, 86, 91, 0.3) 40%, transparent 70%)'
          }}
        />

        <div className="relative z-10">
          {children}
        </div>
        <MobileBottomNav />
        <KenavoAIChatWidget />
        <Toaster position="top-right" />
        </BugReporterWrapper>
      </body>
    </html>
  );
}
