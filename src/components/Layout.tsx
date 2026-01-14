
import { useAppContext } from "@/context/AppContext";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden" dir="ltr">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 bg-[#fbfcfd] custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
