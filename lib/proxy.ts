/**
 * Helper para gerenciar URLs do servidor proxy de streaming
 */

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL || 'https://api.aurorav2.fun';
const PROXY_TOKEN = process.env.NEXT_PUBLIC_PROXY_TOKEN || '';

/**
 * Converte uma URL HTTP em URL do proxy HTTPS
 * @param videoUrl - URL original do vídeo (HTTP)
 * @returns URL do proxy (HTTPS)
 */
export const getProxiedVideoUrl = (videoUrl: string): string => {
  if (!videoUrl) return '';

  // Se já for HTTPS, retorna direto
  if (videoUrl.startsWith('https://')) {
    return videoUrl;
  }

  // Criar URL do proxy
  const proxiedUrl = new URL(`${PROXY_URL}/proxy/stream`);
  proxiedUrl.searchParams.set('url', videoUrl);
  proxiedUrl.searchParams.set('token', PROXY_TOKEN);

  return proxiedUrl.toString();
};

/**
 * Verifica se o proxy está configurado
 */
export const isProxyConfigured = (): boolean => {
  return Boolean(PROXY_URL && PROXY_TOKEN);
};

/**
 * Testa a conexão com o proxy
 */
export const testProxyConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${PROXY_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Erro ao testar conexão com proxy:', error);
    return false;
  }
};
