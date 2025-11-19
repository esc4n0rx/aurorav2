'use client';

import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

export default function PWAUpdateNotifier() {
  const { hasUpdate, newVersion, isUpdating, applyUpdate } = usePWAUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!hasUpdate || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 shadow-lg border border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">
                Atualização Disponível
              </h3>
              <p className="text-white/80 text-xs mt-1">
                {newVersion
                  ? `Versão ${newVersion} está pronta para instalar`
                  : 'Uma nova versão está disponível'}
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/60 hover:text-white ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={applyUpdate}
              disabled={isUpdating}
              className="flex-1 bg-white text-purple-600 rounded-lg py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Atualizar Agora
                </>
              )}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 text-white/80 text-xs hover:text-white transition-colors"
            >
              Depois
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
