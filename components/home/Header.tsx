'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold cursor-pointer"
          >
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Aurora
            </span>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/home" className="text-white hover:text-gray-300 transition-colors">
              Início
            </a>
            <a href="/movies" className="text-gray-400 hover:text-white transition-colors">
              Filmes
            </a>
            <a href="/series" className="text-gray-400 hover:text-white transition-colors">
              Séries
            </a>
            <a href="/watchlist" className="text-gray-400 hover:text-white transition-colors">
              Minha Lista
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User menu */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
              >
                {user?.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={user.display_name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 glass-effect rounded-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">
                      {user?.display_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded mt-2 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
