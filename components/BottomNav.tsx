'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Compass, Search, Bookmark, User } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Início', icon: Home, href: '/home' },
  { id: 'discover', label: 'Descobrir', icon: Compass, href: '/discover' },
  { id: 'search', label: 'Buscar', icon: Search, href: '/search' },
  { id: 'watchlist', label: 'Minha Lista', icon: Bookmark, href: '/watchlist' },
  { id: 'profile', label: 'Perfil', icon: User, href: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/10 pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomnav-active"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className={`w-6 h-6 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-gray-400 group-active:text-white'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-active:text-white'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
