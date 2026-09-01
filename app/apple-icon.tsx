import { ImageResponse } from 'next/og';

/**
 * Apple Touch Icon — Brandão Contabilidade
 * Monograma "BC" em ouro sobre fundo preto (identidade oficial da marca)
 */
export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
                    borderRadius: '36px',
                    border: '8px solid #C9A227',
                }}
            >
                <span
                    style={{
                        fontSize: '96px',
                        fontWeight: 900,
                        color: '#C9A227',
                        fontFamily: 'system-ui, sans-serif',
                        letterSpacing: '-6px',
                    }}
                >
                    BC
                </span>
            </div>
        ),
        {
            width: 180,
            height: 180,
        }
    );
}
