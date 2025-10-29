
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./index";
import { Menu } from "lucide-react";

export default function SidebarController({ children }: { children: React.ReactNode })   {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const hideLayout = ['/login', '/registro', '/inicio'].includes(pathname as string);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isMobile = window.innerWidth < 768;

      if (
        sidebarOpen &&
        isMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <html lang="es">
      <body className="min-h-screen w-full bg-gray-100">  
        {/* <SessionProvider> */}

        
        {/* Sidebar - solo si no está en rutas ocultas */}
        {!hideLayout && (
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            sidebarRef={sidebarRef}
          />
        )}

        {/* Contenedor principal */}
        <div className={`min-h-screen ${!hideLayout ? 'md:ml-64' : ''}`}>
          {/* Topbar - solo si no está en rutas ocultas */}
          {!hideLayout && (
            // <div className="sticky top-0 z-40 bg-white flex items-center justify-between px-4 py-2 border-b">
              <button
                className="md:hidden p-2 rounded hover:bg-gray-200"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {/* Icono de menú */}
                 <Menu size={20} className="text-gray-800" />
              </button>
            // </div>
          )}

          {/* Main content */}
          <main className={hideLayout ? 'min-h-screen flex justify-center items-center' : ''}>
            {children}
          </main>
        </div>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}