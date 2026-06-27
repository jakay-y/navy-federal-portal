import type { Metadata } from "next";
import { Toaster } from "sonner";
import { MemberProvider } from "@/context/member-context";
import { APP_NAME, APP_URL } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Secure online banking for Navy Federal Credit Union members",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: APP_NAME,
    description: "Secure member portal for Navy Federal Credit Union",
    url: APP_URL,
    siteName: "Navy Federal Credit Union",
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
      <body>
        <MemberProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              className: "font-sans",
            }}
          />
        </MemberProvider>
      </body>
    </html>
  );
}