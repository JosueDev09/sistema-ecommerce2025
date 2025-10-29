


import Sidebar from "../components/sidebar";
import "../styles/globals.css";
import { SessionProvider } from 'next-auth/react';
import { Menu } from "lucide-react";
import { Metadata } from 'next/dist/lib/metadata/types/metadata-interface';
import SidebarController from '../components/sidebar/side-bar';


export const metadata: Metadata = {
  title: 'Esymbel Store - Panel de Administración',
  description: 'Panel de administración para la gestión de productos, categorías, empleados y pedidos en Esymbel Store.',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
   
        <SidebarController>{children}</SidebarController>
      
  );
}