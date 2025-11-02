'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function MobileHeader() {
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 w-full bg-gradient-to-b from-black via-black/95 to-transparent pt-safe"
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
        >
          Aurora
        </motion.h1>

        {/* User Avatar */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/profile" className="block">
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.display_name || 'Usuário'}
                className="w-9 h-9 rounded-full border-2 border-white/20 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-2 border-white/20">
                <span className="text-sm font-semibold text-white">
                  {user?.display_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </Link>
        </motion.div>
      </div>
    </motion.header>
  );
}
