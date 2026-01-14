import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6" dir="ltr">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
            <span className="text-[200px] font-black">404</span>
          </div>
          <div className="relative z-10 w-24 h-24 bg-brand-teal/10 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12">
            <AlertCircle className="w-12 h-12 text-brand-teal -rotate-12" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Page non trouvée</h1>
          <p className="text-gray-500 text-lg">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            variant="outline" 
            className="h-12 px-8 rounded-xl font-bold border-gray-200 hover:bg-white hover:border-brand-teal hover:text-brand-teal transition-all gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <Button 
            asChild 
            className="h-12 px-8 rounded-xl font-bold bg-brand-teal hover:bg-brand-teal/90 shadow-xl shadow-brand-teal/20 transition-all gap-2"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              Accueil
            </Link>
          </Button>
        </div>

        <div className="pt-12">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gaz Flow Invoice</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
