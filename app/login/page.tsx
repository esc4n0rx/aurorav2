'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import PWAInstaller from '@/components/PWAInstaller';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          Carregando...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <PWAInstaller />
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />

      {/* Animated background circles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and title */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
            >
              Aurora
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-400 text-lg"
            >
              Sua plataforma de streaming premium
            </motion.p>
          </div>

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass-effect rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-semibold mb-6 text-center text-white">
              Bem-vindo de volta
            </h2>

            <p className="text-center text-gray-400 mb-8">
              Faça login para continuar assistindo seus conteúdos favoritos
            </p>

            <Button
              onClick={handleGoogleSignIn}
              variant="apple"
              size="lg"
              className="w-full text-base font-medium"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Entrar com Google
            </Button>

            <p className="text-center text-xs text-gray-500 mt-6">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
            </p>
          </motion.div>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center text-gray-600 text-sm mt-8"
          >
            Novo no Aurora? Crie sua conta gratuitamente
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
