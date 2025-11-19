'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Film, Tv, Bookmark, Clock, Settings, ChevronRight,
  PlusCircle, X, Send, CheckCircle, XCircle, Loader2, MessageSquarePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserStats, ContentRequest } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Estados
  const [stats, setStats] = useState<UserStats>({
    movies_watched: 0,
    series_watched: 0,
    total_hours: 0,
    saved_content: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestsHistory, setShowRequestsHistory] = useState(false);

  // Estados do formulário de solicitação
  const [contentName, setContentName] = useState('');
  const [contentType, setContentType] = useState<'filme' | 'serie'>('filme');
  const [sourceInfo, setSourceInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Buscar estatísticas
  useEffect(() => {
    if (user?.id) {
      fetchStats();
      fetchRequests();
    }
  }, [user?.id]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/user-stats?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/content-requests?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contentName.trim()) {
      toast.error('Digite o nome do conteúdo');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/content-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          contentName: contentName.trim(),
          contentType,
          sourceInfo: sourceInfo.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Solicitação enviada com sucesso!');
        setShowRequestModal(false);
        setContentName('');
        setContentType('filme');
        setSourceInfo('');
        fetchRequests();
      } else {
        toast.error(data.error || 'Erro ao enviar solicitação');
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'concluido':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
            <CheckCircle className="w-3 h-3" />
            Concluído
          </span>
        );
      case 'rejeitado':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
            <XCircle className="w-3 h-3" />
            Rejeitado
          </span>
        );
      default:
        return null;
    }
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
            value={loadingStats ? '-' : stats.movies_watched}
            color="from-orange-500 to-red-500"
          />
          <StatCard
            icon={Tv}
            label="Séries"
            value={loadingStats ? '-' : stats.series_watched}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Clock}
            label="Horas"
            value={loadingStats ? '-' : stats.total_hours}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={Bookmark}
            label="Salvos"
            value={loadingStats ? '-' : stats.saved_content}
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
            icon={MessageSquarePlus}
            label="Solicitar Conteúdo"
            onClick={() => setShowRequestModal(true)}
            highlight
          />
          <MenuOption
            icon={PlusCircle}
            label="Minhas Solicitações"
            onClick={() => setShowRequestsHistory(true)}
            badge={requests.filter(r => r.status === 'pendente').length || undefined}
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
          <MenuOption
            icon={Settings}
            label="Configurações"
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

      {/* Modal de Solicitação de Conteúdo */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Solicitar Conteúdo</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Conteúdo *
                  </label>
                  <input
                    type="text"
                    value={contentName}
                    onChange={(e) => setContentName(e.target.value)}
                    placeholder="Ex: Breaking Bad, Inception..."
                    className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setContentType('filme')}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        contentType === 'filme'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                          : 'bg-zinc-800 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <Film className="w-5 h-5 mx-auto mb-1" />
                      Filme
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentType('serie')}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        contentType === 'serie'
                          ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                          : 'bg-zinc-800 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <Tv className="w-5 h-5 mx-auto mb-1" />
                      Série
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Onde encontrar? (opcional)
                  </label>
                  <input
                    type="text"
                    value={sourceInfo}
                    onChange={(e) => setSourceInfo(e.target.value)}
                    placeholder="Ex: Netflix, Prime Video..."
                    className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Histórico de Solicitações */}
      <AnimatePresence>
        {showRequestsHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequestsHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Minhas Solicitações</h2>
                <button
                  onClick={() => setShowRequestsHistory(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 -mx-6 px-6">
                {loadingRequests ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquarePlus className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">Nenhuma solicitação ainda</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Clique em "Solicitar Conteúdo" para fazer uma
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-zinc-800/50 rounded-xl p-4 border border-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{request.content_name}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {request.content_type === 'filme' ? 'Filme' : 'Série'}
                              {request.source_info && ` • ${request.source_info}`}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        {request.admin_note && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            "{request.admin_note}"
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mt-2">
                          {new Date(request.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number | string;
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

function MenuOption({ icon: Icon, label, onClick, highlight, badge }: {
  icon: any;
  label: string;
  onClick: () => void;
  highlight?: boolean;
  badge?: number;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl glass-effect border transition-colors ${
        highlight
          ? 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          highlight ? 'bg-purple-500/20' : 'bg-white/5'
        }`}>
          <Icon className={`w-5 h-5 ${highlight ? 'text-purple-400' : 'text-gray-300'}`} strokeWidth={2} />
        </div>
        <span className={`font-medium ${highlight ? 'text-purple-400' : ''}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && badge > 0 && (
          <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </div>
    </motion.button>
  );
}
