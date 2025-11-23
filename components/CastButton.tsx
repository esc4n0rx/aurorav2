import React, { useEffect, useRef } from 'react';
import { Cast } from 'lucide-react';
import { useCast } from '@/hooks/useCast';

// Componente para o botão nativo do Google Cast
// O SDK do Google Cast substitui este elemento pelo botão oficial se usarmos a classe 'google-cast-button'
// Mas como queremos um design customizado, vamos usar a API para acionar o menu

interface CastButtonProps {
    onCast?: () => void;
    className?: string;
}

export default function CastButton({ onCast, className = '' }: CastButtonProps) {
    const { isApiAvailable, isConnected } = useCast();

    const handleClick = () => {
        if (isApiAvailable) {
            // Solicitar o diálogo de cast
            window.cast.framework.CastContext.getInstance().requestSession();
            if (onCast) onCast();
        } else {
            console.warn('Cast API não disponível');
        }
    };

    // Se a API não estiver disponível (ex: não é Chrome ou script não carregou), não renderiza nada
    // Ou renderiza desabilitado
    if (!isApiAvailable) {
        return null;
    }

    return (
        <button
            onClick={handleClick}
            className={`flex items-center justify-center p-2 rounded-full transition-colors ${isConnected ? 'text-blue-500 bg-white/10' : 'text-white hover:text-gray-300'
                } ${className}`}
            aria-label="Google Cast"
        >
            <Cast className={`h-6 w-6 ${isConnected ? 'fill-current' : ''}`} />
        </button>
    );
}
