import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-12 sm:py-24 px-4 text-center">
        <span className="text-6xl sm:text-8xl mb-6">🎈</span>
        <h1 className="text-4xl sm:text-6xl font-bold text-primary mb-2">404</h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8">
          Oops! This page doesn't exist.
        </p>
        <Button size="lg" asChild>
          <Link to="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <div className="lg:hidden h-20" />
      <MobileBottomNav />
    </div>
  );
};

export default NotFound;
