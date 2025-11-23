import { useState, useEffect, useCallback } from 'react';

declare global {
    interface Window {
        chrome: any;
        cast: any;
        __onGCastApiAvailable: (isAvailable: boolean) => void;
    }
}

interface CastOptions {
    applicationId?: string;
}

export function useCast({ applicationId = 'CC1AD845' }: CastOptions = {}) {
    const [isApiAvailable, setIsApiAvailable] = useState(false);
    const [castSession, setCastSession] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Inicializar o Cast Context
    useEffect(() => {
        window.__onGCastApiAvailable = (isAvailable) => {
            if (isAvailable) {
                initializeCastApi();
            }
        };

        // Se a API já estiver carregada (navegação entre páginas)
        if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
            initializeCastApi();
        }
    }, [applicationId]);

    const initializeCastApi = () => {
        try {
            const castContext = window.cast.framework.CastContext.getInstance();

            castContext.setOptions({
                receiverApplicationId: applicationId,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            });

            setIsApiAvailable(true);

            // Listeners de sessão
            castContext.addEventListener(
                window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                (event: any) => {
                    switch (event.sessionState) {
                        case window.cast.framework.SessionState.SESSION_STARTED:
                        case window.cast.framework.SessionState.SESSION_RESUMED:
                            setCastSession(castContext.getCurrentSession());
                            setIsConnected(true);
                            break;
                        case window.cast.framework.SessionState.SESSION_ENDED:
                            setCastSession(null);
                            setIsConnected(false);
                            break;
                    }
                }
            );

            // Verificar sessão atual
            const currentSession = castContext.getCurrentSession();
            if (currentSession) {
                setCastSession(currentSession);
                setIsConnected(true);
            }

        } catch (error) {
            console.error('Erro ao inicializar Cast API:', error);
        }
    };

    const castMedia = useCallback((mediaUrl: string, metadata: {
        title: string;
        subtitle?: string;
        imageUrl?: string;
        contentType?: string;
    }) => {
        if (!castSession) {
            console.warn('Nenhuma sessão de Cast ativa');
            // Tentar abrir o diálogo de cast se não estiver conectado
            if (isApiAvailable) {
                window.cast.framework.CastContext.getInstance().requestSession().then(
                    (err: any) => {
                        if (!err) {
                            // Sessão iniciada, tentar cast novamente (pode precisar de um pequeno delay ou callback)
                            // Por simplicidade, o usuário clica de novo ou usamos um estado para retry
                        }
                    },
                    (err: any) => console.error('Erro ao solicitar sessão:', err)
                );
            }
            return;
        }

        const { title, subtitle, imageUrl, contentType = 'video/mp4' } = metadata;

        const mediaInfo = new window.chrome.cast.media.MediaInfo(mediaUrl, contentType);

        // Metadados
        const requestMetadata = new window.chrome.cast.media.GenericMediaMetadata();
        requestMetadata.title = title;
        requestMetadata.subtitle = subtitle || '';
        if (imageUrl) {
            requestMetadata.images = [new window.chrome.cast.Image(imageUrl)];
        }

        mediaInfo.metadata = requestMetadata;

        const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
        request.autoplay = true;

        castSession.loadMedia(request).then(
            () => {
                console.log('Load succeed');
            },
            (errorCode: any) => {
                console.error('Error code: ' + errorCode);
            }
        );
    }, [castSession, isApiAvailable]);

    return {
        isApiAvailable,
        isConnected,
        castMedia,
        castSession
    };
}
