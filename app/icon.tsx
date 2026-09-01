import { ImageResponse } from 'next/og';

/**
 * Favicon dinâmico — Brandão Contabilidade
 * Monograma "BC" em ouro sobre fundo preto (identidade oficial da marca)
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
                    borderRadius: '6px',
                    border: '2px solid #C9A227',
                }}
            >
                <span
                    style={{
                        fontSize: '17px',
                        fontWeight: 900,
                        color: '#C9A227',
                        fontFamily: 'system-ui, sans-serif',
                        letterSpacing: '-1px',
                    }}
                >
                    BC
                </span>
            </div>
        ),
        {
            width: 32,
            height: 32,
        }
    );
}
