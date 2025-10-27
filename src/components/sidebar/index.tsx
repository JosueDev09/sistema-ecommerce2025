'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NavLink from './nav-link';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  Users,
  UserPlus,
  Truck,
  ClipboardList,
  Plus,
  Building2,
  Boxes,
  ClipboardCheck,
  Settings,
  Layers3,
  ShoppingCart,
  X,ChevronDown,Activity
} from "lucide-react";
import { useSession } from 'next-auth/react';

const routes = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: ["SuperAdmin", "admin", "usuario"],
  },
  {
    name: "Pedidos",
    path: "/pedidos",
    icon: <ClipboardList size={20} />,
    roles: ["SuperAdmin", "admin", "usuario"],
  },
  {
    name: "Proveedores",
    icon: <Truck size={20} />,
    roles: ["SuperAdmin"],
    children: [
      {
        name: "Alta proveedor",
        path: "/proveedores/alta-proveedor",
        icon: <Plus size={18} />,
      },
      {
        name: "Proveedores",
        path: "/proveedores/lista-proveedores",
        icon: <Building2 size={18} />,
      },
    ],
  },
  {
    name: "Administración",
    icon: <Users size={20} />,
    roles: ["SuperAdmin"],
    children: [
      {
        name: "Alta usuario",
        path: "/usuarios/alta-usuario",
        icon: <UserPlus size={18} />,
      },
      {
        name: "Usuarios",
        path: "/usuarios/lista-usuarios",
        icon: <Users size={18} />,
      },
    ],
  },
  {
    name: "Productos",
    icon: <ShoppingBag size={20} />,
    roles: ["SuperAdmin"],
    children: [
      {
        name: "Alta producto",
        path: "/productos/alta-producto",
        icon: <Plus size={18} />,
      },
      {
        name: "Productos",
        path: "/productos/lista-productos",
        icon: <Package size={18} />,
      },
    ],
  },
  {
    name: "Categorías",
    icon: <Tags size={20} />,
    roles: ["SuperAdmin"],
    children: [
      {
        name: "Alta categoría",
        path: "/categorias/alta-categoria",
        icon: <Plus size={18} />,
      },
      {
        name: "Categorías",
        path: "/categorias/lista-categorias",
        icon: <Layers3 size={18} />,
      },
    ],
  },
  {
    name: "Inventario",
    path: "/inventario",
    icon: <Boxes size={20} />,
    roles: ["SuperAdmin", "admin", "usuario"],
  },
];

export default function Sidebar({
  isOpen,
  onToggle,
  sidebarRef,
}: {
  isOpen: boolean;
  onToggle: () => void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
}) {
  const pathname = usePathname();
  // const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // useEffect(() => {
  //   if (session?.user?.rol) {
  //     setUserRole(session.user.rol.toLowerCase());
  //   } else {
  //     const roleMatch = document.cookie.match(/(^| )role=([^;]+)/);
  //     const role = roleMatch?.[2];
  //     if (role) {
  //       setUserRole(role.toLowerCase());
  //     } else {
  //       console.warn("No se encontró cookie 'role'");
  //     }
  //   }
  // }, [session]);

  // Auto-abrir menú si una ruta hija está activa
  useEffect(() => {
    routes.forEach(route => {
      if (route.children) {
        const hasActiveChild = route.children.some(child => pathname === child.path);
        if (hasActiveChild && !openMenus.includes(route.name)) {
          setOpenMenus(prev => [...prev, route.name]);
        }
      }
    });
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const filteredRoutes = routes.filter(route =>
    route.roles.map(r => r.toLowerCase()).includes((userRole || '').toLowerCase())
  );

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-72 bg-slate-900 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
               </svg>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight">Esymbel</h1>
              <p className="text-slate-400 text-xs">Store System</p>
            </div>
          </div>
          
          {/* Botón cerrar solo en móvil */}
          <button
            onClick={onToggle}
            className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {filteredRoutes.map(route => (
            route.children ? (
              // Menú con submenús
              <div key={route.name} className="space-y-1">
                <button
                  onClick={() => toggleMenu(route.name)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-blue-400 transition-colors">
                      {route.icon}
                    </span>
                    <span className="text-sm font-medium">{route.name}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-500 transition-transform duration-200 ${
                      openMenus.includes(route.name) ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Submenú */}
                <div
                  className={`ml-4 space-y-1 overflow-hidden transition-all duration-200 ${
                    openMenus.includes(route.name) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {route.children.map(sub => (
                    <NavLink key={sub.path} href={sub.path} active={pathname === sub.path}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          pathname === sub.path
                            ? 'bg-blue-500/10 text-blue-400 font-medium'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className={pathname === sub.path ? 'text-blue-400' : ''}>
                          {sub.icon}
                        </span>
                        <span>{sub.name}</span>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              // Menú simple
              <NavLink key={route.path} href={route.path} active={pathname === route.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    pathname === route.path
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 font-medium'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={pathname === route.path ? 'text-white' : 'text-slate-400'}>
                    {route.icon}
                  </span>
                  <span>{route.name}</span>
                </div>
              </NavLink>
            )
          ))}
        </nav>

        {/* Footer - Info de usuario */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {/* {session?.user?.name?.[0]?.toUpperCase() || 'U'} */}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                <span>Usuario</span>
                {/* {session?.user?.name || 'Usuario'} */}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">
                {/* {userRole || 'Cargando...'} */}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}