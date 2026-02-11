import { ImageResponse } from 'next/og';

/**
 * Gerador de OG Image dinâmica — Brandão Contabilidade
 * Acessível em: /api/og
 * Usada como imagem de compartilhamento nas redes sociais
 */
export const runtime = 'edge';

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #0A0A0B 0%, #1a1a1d 50%, #0A0A0B 100%)',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Geometric background elements */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '50%',
                        height: '100%',
                        background: 'linear-gradient(135deg, transparent 0%, rgba(255, 176, 0, 0.05) 100%)',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: '#FFB000',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: '#FFB000',
                        display: 'flex',
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '16px',
                    }}
                >
                    {/* Pre-title */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <div style={{ width: '60px', height: '2px', background: '#FFB000', display: 'flex' }} />
                        <span
                            style={{
                                color: '#FFB000',
                                fontSize: '16px',
                                letterSpacing: '6px',
                                textTransform: 'uppercase',
                                fontWeight: 900,
                            }}
                        >
                            DESDE 1993 • SIDROLÂNDIA - MS
                        </span>
                        <div style={{ width: '60px', height: '2px', background: '#FFB000', display: 'flex' }} />
                    </div>

                    {/* Main title */}
                    <h1
                        style={{
                            color: '#FFFFFF',
                            fontSize: '72px',
                            fontWeight: 900,
                            letterSpacing: '-2px',
                            textTransform: 'uppercase',
                            lineHeight: 0.9,
                            margin: '20px 0 0 0',
                        }}
                    >
                        BRANDÃO
                    </h1>
                    <h2
                        style={{
                            color: '#FFB000',
                            fontSize: '48px',
                            fontWeight: 900,
                            fontStyle: 'italic',
                            letterSpacing: '-1px',
                            textTransform: 'uppercase',
                            lineHeight: 0.9,
                            margin: 0,
                        }}
                    >
                        CONTABILIDADE
                    </h2>

                    {/* Subtitle */}
                    <p
                        style={{
                            color: '#888888',
                            fontSize: '20px',
                            fontWeight: 600,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            marginTop: '24px',
                        }}
                    >
                        Soluções Contábeis de Alta Performance
                    </p>

                    {/* Services */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            marginTop: '16px',
                        }}
                    >
                        {['FISCAL', 'TRABALHISTA', 'AGRONEGÓCIO', 'LEGALIZAÇÃO'].map((service) => (
                            <span
                                key={service}
                                style={{
                                    color: '#555555',
                                    fontSize: '12px',
                                    letterSpacing: '3px',
                                    textTransform: 'uppercase',
                                    fontWeight: 700,
                                    padding: '6px 12px',
                                    border: '1px solid #333',
                                }}
                            >
                                {service}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
