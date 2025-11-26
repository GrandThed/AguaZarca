import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

// Suppress react-beautiful-dnd defaultProps warning
// This is a known issue with the library and doesn't affect functionality
if (typeof window !== 'undefined') {
  const originalError = console.error;
  (console as any).error = function(...args: any[]) {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Support for defaultProps will be removed')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export const metadata: Metadata = {
  title: "AguaZarca - Inmobiliaria en Argentina",
  description: "Encuentra tu propiedad ideal con AguaZarca. Venta y alquiler de propiedades en Argentina.",
  keywords: "inmobiliaria, propiedades, venta, alquiler, argentina, casas, departamentos",
  openGraph: {
    title: "AguaZarca - Inmobiliaria",
    description: "Encuentra tu propiedad ideal con AguaZarca",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "AguaZarca",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <FloatingWhatsApp />
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
