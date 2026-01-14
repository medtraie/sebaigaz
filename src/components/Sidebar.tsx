
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  FileText, 
  Users, 
  Box, 
  Database, 
  UserCheck, 
  ChevronDown, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAppContext();
  const [collapsed, setCollapsed] = useState(false);
  const [distributionOpen, setDistributionOpen] = useState(false);

  const navItems = [
    { name: "Inventaire", path: "/inventory", icon: <Box size={22} /> },
    { name: "Clients", path: "/clients", icon: <Users size={22} /> },
    { name: "Factures", path: "/invoices", icon: <FileText size={22} /> },
  ];

  const distributionItems = [
    { name: "Distribution Auto", path: "/distribution-automatique", icon: <Database size={18} /> },
    { name: "Distribution Manuelle", path: "/distribution-manuelle", icon: <UserCheck size={18} /> },
  ];

  const settingsItems = [
    { name: "Paramètres", path: "/settings", icon: <Settings size={22} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      dir="ltr"
      className={cn(
        "bg-white border-r border-gray-100 transition-all duration-500 h-screen sticky top-0 flex flex-col shadow-2xl z-50",
        collapsed ? "w-24" : "w-72"
      )}
    >
      <div className="p-8 flex items-center justify-between border-b border-gray-50 mb-6">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[40px] h-10 bg-brand-teal/10 rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-lg font-black text-brand-teal">GF</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-gray-900 tracking-tight">Gaz Flow</span>
              <span className="text-xs font-medium text-gray-400 tracking-[0.16em] uppercase">
                Système de gaz
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner hover:bg-brand-teal/20 transition-colors cursor-pointer"
          >
            <span className="text-base font-black text-brand-teal">GF</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {!collapsed && (
            <div className="px-4 mb-4 flex items-center justify-between">
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                Menu principal
              </p>
              <LayoutDashboard size={16} className="text-gray-300" />
            </div>
          )}
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive(item.path) 
                  ? "bg-brand-teal text-white shadow-xl shadow-brand-teal/30 scale-[1.02]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-teal",
                collapsed && "justify-center px-0"
              )}
            >
              {isActive(item.path) && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/30 rounded-r-full" />
              )}
              <div className={cn(
                "transition-all duration-300",
                isActive(item.path) ? "text-white scale-110" : "text-gray-400 group-hover:text-brand-teal group-hover:scale-110"
              )}>
                {item.icon}
              </div>
              {!collapsed && <span className="font-bold text-base">{item.name}</span>}
            </Link>
          ))}

          {/* Distribution Submenu */}
          <div className="mt-2">
            {collapsed ? (
              <Link
                to="/distribution-automatique"
                className={cn(
                  "flex items-center justify-center px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-brand-teal transition-all duration-300",
                  location.pathname.includes("/distribution") && "bg-brand-teal/10 text-brand-teal"
                )}
              >
                <Database size={24} />
              </Link>
            ) : (
              <Collapsible open={distributionOpen} onOpenChange={setDistributionOpen}>
                <CollapsibleTrigger className={cn(
                  "flex items-center justify-between w-full px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-brand-teal transition-all duration-300 group",
                  location.pathname.includes("/distribution") && "text-brand-teal bg-brand-teal/5"
                )}>
                  <div className="flex items-center gap-4">
                    <Database size={22} className={cn(
                      "transition-all duration-300",
                      location.pathname.includes("/distribution") ? "text-brand-teal scale-110" : "text-gray-400 group-hover:text-brand-teal group-hover:scale-110"
                    )} />
                    <span className="font-bold text-base">Distributions</span>
                  </div>
                  <ChevronDown size={18} className={cn(
                    "transition-transform duration-500 opacity-60",
                    distributionOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2 pl-12 pr-2 animate-in slide-in-from-top-2 duration-300">
                  {distributionItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 relative",
                        isActive(item.path) 
                          ? "text-brand-teal font-black bg-brand-teal/10" 
                          : "text-gray-500 hover:text-brand-teal hover:bg-gray-50"
                      )}
                    >
                      {isActive(item.path) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand-teal rounded-r-full" />
                      )}
                      {item.name}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-2">
          {!collapsed && (
            <p className="px-4 mb-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Paramètres
            </p>
          )}
          {settingsItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive(item.path) 
                  ? "bg-brand-teal text-white shadow-xl shadow-brand-teal/30 scale-[1.02]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-brand-teal",
                collapsed && "justify-center px-0"
              )}
            >
              {isActive(item.path) && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/30 rounded-r-full" />
              )}
              <div className={cn(
                "transition-all duration-300",
                isActive(item.path) ? "text-white scale-110" : "text-gray-400 group-hover:text-brand-teal group-hover:scale-110"
              )}>
                {item.icon}
              </div>
              {!collapsed && <span className="font-bold text-base">{item.name}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto space-y-3 bg-gray-50/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-12 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-brand-teal hover:bg-gray-50 hover:border-brand-teal/20 transition-all duration-300 shadow-sm group"
        >
          {collapsed ? <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /> : <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />}
        </button>
        
        <Button
          onClick={logout}
          variant="ghost"
          className={cn(
            "w-full h-14 flex items-center gap-4 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 font-black",
            collapsed ? "justify-center px-0" : "px-4 justify-start"
          )}
        >
          <LogOut size={22} />
          {!collapsed && <span className="text-base">Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
}
