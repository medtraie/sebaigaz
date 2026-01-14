
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Flame, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (login(code, code)) {
      toast.success("Connexion réussie", {
        description: "Bienvenue dans votre système de distribution.",
      });
    } else {
      toast.error("Code secret incorrect", {
        description: "Veuillez vérifier le code et réessayer.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] relative overflow-hidden" dir="ltr">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-teal/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-teal/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md px-4 z-10">
        <div className="bg-white shadow-2xl shadow-brand-teal/10 rounded-[2rem] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-brand-teal/20">
          <div className="p-8 sm:p-12">
            {/* Header Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-brand-teal/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse-slow">
                <Flame className="w-12 h-12 text-brand-teal" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center">
                Gaz Flow
              </h1>
              <div className="h-1.5 w-16 bg-brand-teal rounded-full mt-3 mb-5" />
              <p className="text-gray-500 text-center font-bold text-lg">
                Système de Distribution de Gaz
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label 
                  htmlFor="code" 
                  className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-brand-teal" />
                  Code Secret
                </label>
                <div className="relative group">
                  <Input
                    id="code"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoFocus
                    required
                    className="h-14 px-5 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal transition-all duration-300 pr-14 text-center text-lg tracking-widest font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-teal transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-brand-teal hover:bg-brand-teal/90 text-white text-lg font-black rounded-2xl shadow-xl shadow-brand-teal/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    Se Connecter
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center">
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-black">
                PROTÉGÉ PAR SEBAI
              </p>
            </div>
          </div>
        </div>
        
        {/* Simple helper text below the card */}
        <p className="text-center mt-10 text-sm text-gray-400 font-medium">
          © {new Date().getFullYear()} Gaz Flow Distribution. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
