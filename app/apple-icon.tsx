import { ImageResponse } from 'next/og';

/**
 * Apple Touch Icon — Brandão Contabilidade
 * Gera o ícone para dispositivos Apple (180x180)
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
                }}
            >
                <span
                    style={{
                        fontSize: '120px',
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
            width: 180,
            height: 180,
        }
    );
}
