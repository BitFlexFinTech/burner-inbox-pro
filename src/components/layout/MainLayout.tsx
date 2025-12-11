import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background bg-grid relative">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Navbar />
      <main className="relative pt-16">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
