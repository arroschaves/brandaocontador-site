import { ImageResponse } from 'next/og';

/**
 * Favicon dinâmico — Brandão Contabilidade
 * Gera o ícone da aba do navegador com "B" em amber sobre fundo obsidian
 */
export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0A0A0B',
                    borderRadius: '4px',
                    border: '2px solid #FFB000',
                }}
            >
                <span
                    style={{
                        fontSize: '22px',
                        fontWeight: 900,
                        color: '#FFB000',
                        fontFamily: 'system-ui, sans-serif',
                        fontStyle: 'italic',
                    }}
                >
                    B
                </span>
            </div>
        ),
        {
            width: 32,
            height: 32,
        }
    );
}
