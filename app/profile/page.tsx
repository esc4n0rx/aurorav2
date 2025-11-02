'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';
import { LogOut, Film, Tv, Bookmark, Clock, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock stats - em produção viria do Supabase
const mockStats = {
  moviesWatched: 47,
  seriesWatched: 23,
  totalHours: 156,
  savedContent: 12,
};

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header with gradient */}
      <div className="relative h-32 bg-gradient-to-b from-purple-900/50 via-purple-900/20 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
      </div>

      {/* Profile Info */}
      <div className="relative px-4 -mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="relative mb-4"
          >
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.display_name || 'Usuário'}
                className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-4 border-white/20 shadow-xl">
                <span className="text-3xl font-bold text-white">
                  {user.display_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-black" />
          </motion.div>

          {/* Name & Email */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold mb-1"
          >
            {user.display_name || 'Usuário'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-gray-400 mb-6"
          >
            {user.email}
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <StatCard
            icon={Film}
            label="Filmes"
            value={mockStats.moviesWatched}
            color="from-orange-500 to-red-500"
          />
          <StatCard
            icon={Tv}
            label="Séries"
            value={mockStats.seriesWatched}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Clock}
            label="Horas"
            value={mockStats.totalHours}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={Bookmark}
            label="Salvos"
            value={mockStats.savedContent}
            color="from-green-500 to-emerald-500"
          />
        </motion.div>

        {/* Menu Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-2 mb-6"
        >
          <MenuOption
            icon={Settings}
            label="Configurações"
            onClick={() => {}}
          />
          <MenuOption
            icon={Bookmark}
            label="Minha Lista"
            onClick={() => router.push('/watchlist')}
          />
          <MenuOption
            icon={Clock}
            label="Histórico"
            onClick={() => {}}
          />
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full h-12 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sair da Conta
          </Button>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="relative overflow-hidden rounded-2xl p-4 glass-effect border border-white/10"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
      <div className="relative">
        <Icon className="w-6 h-6 mb-2 text-white" strokeWidth={2} />
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </motion.div>
  );
}

function MenuOption({ icon: Icon, label, onClick }: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-xl glass-effect border border-white/10 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-300" strokeWidth={2} />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500" />
    </motion.button>
  );
}
