'use client';

import Link from 'next/link';
import { cn } from '../../lib/utils'; // Puedes crear esta función o quitarla

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active: boolean;
}

export default function NavLink({ href, children, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 rounded-md hover:bg-blue-400 transition-colors block',
        active ? 'bg-blue-500 text-white font-semibold' : 'text-white'
      )}
    >
      {children}
    </Link>
  );
}
