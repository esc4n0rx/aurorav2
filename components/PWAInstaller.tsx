"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, MoreVertical, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

const STORAGE_KEY = 'aurora_pwa_installed';

const PWAInstaller = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const deferredPrompt = useRef<any>(null); // Use useRef for mutable object like deferredPrompt

  useEffect(() => {
    // Verificar se já foi instalado antes
    const wasInstalled = localStorage.getItem(STORAGE_KEY) === 'true';

    const userAgent = navigator.userAgent;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(isMobileDevice);

    // Verificar se está rodando como standalone (PWA instalado)
    const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true ||
                           wasInstalled;

    setIsStandalone(isStandalonePWA);

    if (isStandalonePWA) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }

    if (isMobileDevice && !isStandalonePWA) {
      setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));

      // Listen for beforeinstallprompt event
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        deferredPrompt.current = e;
        setShowInstallPrompt(true);
      };

      // Listen for appinstalled event
      const handleAppInstalled = () => {
        setShowInstallPrompt(false);
        setIsStandalone(true);
        localStorage.setItem(STORAGE_KEY, 'true');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Cleanup
      setIsChecking(false);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    setIsChecking(false);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      deferredPrompt.current.userChoice.then((choiceResult: { outcome: string; }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
          setShowInstallPrompt(false);
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt.current = null;
      });
    }
  };

  // Não renderizar nada enquanto verifica o estado
  if (isChecking) {
    return null;
  }

  // Se já está instalado (standalone), não mostrar nada
  if (isStandalone) {
    return null;
  }

  if (!isMobile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-900/30 via-black/50 to-blue-900/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-white text-center shadow-lg max-w-md mx-auto"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Acesso Restrito
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Esta aplicação é exclusiva para dispositivos móveis para uma experiência otimizada.
          </p>
          <p className="mt-2 text-md text-gray-400">
            Acesse-nos pelo seu smartphone ou tablet.
          </p>
        </motion.div>
      </div>
    );
  }

  // If mobile and not standalone
  if (isMobile && !isStandalone) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-900/30 via-black/50 to-blue-900/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-white text-center shadow-lg max-w-md mx-auto"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Instale o Aurora App
          </h2>
          <p className="mb-6 text-lg text-gray-300">
            Para a melhor experiência, adicione nosso aplicativo à sua tela inicial!
          </p>
          
          {/* Direct Install Prompt for Chrome/Android */}
          {showInstallPrompt && (
            <div className="mb-6">
              <Button
                onClick={handleInstallClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Instalar Aplicativo
              </Button>
            </div>
          )}

          {isIOS ? (
            <div className="flex flex-col items-center">
              <Share2 className="h-10 w-10 text-blue-400 mb-4" />
              <p className="mb-2 text-md text-gray-200">
                1. No Safari, toque no ícone de compartilhamento <Share2 className="inline-block h-5 w-5" />
                (um quadrado com uma seta para cima), geralmente encontrado na parte inferior da tela.
              </p>
              <p className="mb-2 text-md text-gray-200">
                2. Role para baixo na lista de opções e selecione "Adicionar à Tela de Início".
              </p>
              <p className="mt-4 text-sm text-gray-400">
              </p>
            </div>
          ) : ( // Fallback for other browsers, including Chrome if beforeinstallprompt hasn't fired or is not supported
            <div className="flex flex-col items-center">
              <Download className="h-10 w-10 text-gray-400 mb-4" />
              <p className="text-md text-gray-300">
                {showInstallPrompt
                  ? "Se o botão 'Instalar Aplicativo' acima não aparecer, ou se você estiver em outro navegador:"
                  : "Use o Google Chrome ou Safari para instalar o aplicativo e ter a melhor experiência."}
              </p>
              {!showInstallPrompt && ( // Display generic Chrome instructions only if direct prompt is not available
                <>
                  <MoreVertical className="h-10 w-10 text-green-400 mb-4 mt-4" />
                  <p className="mb-2 text-md text-gray-200">
                    1. No Chrome, toque nos três pontos <MoreVertical className="inline-block h-5 w-5" />
                    (menu) no canto superior direito do navegador.
                  </p>
                  <p className="mb-2 text-md text-gray-200">
                    2. No menu que se abre, procure e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".
                  </p>
                </>
              )}
              <p className="mt-4 text-sm text-gray-400">
              </p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return null;
};

export default PWAInstaller;