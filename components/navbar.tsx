'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Home' },
    { href: '/adoption', label: 'Adoption' },
    { href: '/macro', label: 'Macro' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            Stabby<span className="text-amber-500">BTC</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-amber-500 ${
                  pathname === link.href ? 'text-amber-500' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
