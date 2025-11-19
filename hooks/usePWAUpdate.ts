'use client';

import { useEffect, useState, useCallback } from 'react';

interface PWAUpdateState {
  hasUpdate: boolean;
  newVersion: string | null;
  isUpdating: boolean;
}

export function usePWAUpdate() {
  const [state, setState] = useState<PWAUpdateState>({
    hasUpdate: false,
    newVersion: null,
    isUpdating: false,
  });

  // Aplica a atualização
  const applyUpdate = useCallback(() => {
    setState(prev => ({ ...prev, isUpdating: true }));

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Envia mensagem para o SW atualizar
      navigator.serviceWorker.controller.postMessage({
        type: 'SKIP_WAITING',
      });

      // Recarrega a página após um pequeno delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      window.location.reload();
    }
  }, []);

  // Limpa o cache manualmente
  const clearCache = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
      });

      // Recarrega após limpar
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, []);

  // Obtém a versão atual do SW
  const getVersion = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );

        // Timeout se não receber resposta
        setTimeout(() => resolve(null), 1000);
      } else {
        resolve(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Escuta mensagens do Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log(`[PWA] Nova versão disponível: ${event.data.version}`);
        setState({
          hasUpdate: true,
          newVersion: event.data.version,
          isUpdating: false,
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Verifica se há atualização pendente
    navigator.serviceWorker.ready.then((registration) => {
      // Verifica atualizações periodicamente (a cada 1 hora)
      const checkInterval = setInterval(() => {
        registration.update().catch(console.error);
      }, 60 * 60 * 1000);

      // Verifica se há um SW em espera
      if (registration.waiting) {
        setState({
          hasUpdate: true,
          newVersion: null,
          isUpdating: false,
        });
      }

      // Escuta quando um novo SW está pronto
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState({
                hasUpdate: true,
                newVersion: null,
                isUpdating: false,
              });
            }
          });
        }
      });

      return () => clearInterval(checkInterval);
    });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    ...state,
    applyUpdate,
    clearCache,
    getVersion,
  };
}
