import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "ZoraFlow – AI-Powered PRD Generator",
    description:
        "Transform your product idea into a detailed PRD, architecture diagrams, and Bill of Materials using ZoraFlow's AI-powered pipeline.",
    openGraph: {
        title: "ZoraFlow – AI-Powered PRD Generator",
        description: "Natural Language to Technical Reality in 3 stages.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body
                className={`${inter.variable} antialiased`}
                suppressHydrationWarning
            >
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

