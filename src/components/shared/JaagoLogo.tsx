import React from 'react';

interface JaagoLogoProps {
    onClick?: () => void;
    scale?: number;
    color?: string;
    showFoundation?: boolean;
}

const JaagoLogo: React.FC<JaagoLogoProps> = ({ onClick, scale = 1, color = 'var(--text-main)', showFoundation = true }) => {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                cursor: onClick ? 'pointer' : 'default',
                transform: `scale(${scale})`,
                transformOrigin: 'left center'
            }}
        >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                {/* The signature lowercase 'j' with its square dot */}
                <span style={{
                    fontSize: '4.5rem', fontWeight: 900, color: 'var(--primary)',
                    fontFamily: "'Playfair Display', serif", lineHeight: 0.7,
                    filter: 'drop-shadow(0 0 10px rgba(245, 197, 24, 0.3))',
                    marginRight: '2px'
                }}>j</span>

                {/* The Bangladesh Map Silhouette */}
                <div style={{
                    position: 'absolute', left: '3.8rem', top: '-15px', zIndex: 0,
                    opacity: 0.9, color: color, pointerEvents: 'none'
                }}>
                    <svg width="110" height="110" viewBox="0 0 512 512" fill="currentColor">
                        <path d="M304.5,417.4c0,0-5.7,3.1-13.9,5.2c-8.2,2.1-12.4,5.2-12.4,5.2s2.1,10.3,1.5,13.9s-1.5,12.9-1.5,12.9s-15.5-2.6-18.6-4.6 c-3.1-2.1-7.2-1-7.2-1s-3.6,18.6-6.2,23.2s-7.2,14.4-12.9,12.9s-23.7-30.9-23.7-30.9s-19.1-31.4-19.1-38.7s4.1-12.9,4.1-12.9 s16-2.1,20.6-5.7s11.9-10.3,11.9-10.3s6.7-27.8,7.7-34c1-6.2-7.2-16.5-7.2-16.5s-19.1-19.1-22.2-22.7c-3.1-3.6,10.3-25.2,12.4-28.3 c2.1-3.1,12.4-7.2,12.4-7.2s11.3-4.1,13.9-6.7s11.9-15.5,11.9-15.5s17,21.1,19.6,23.7s18,29.4,18,29.4s11.9,13.4,14.4,14.4 s19.1-6.7,21.1-7.7s13.4-1,16,1s7.7,11.3,7.7,11.3s-0.5,11.9-0.5,16.5s9.8,24.2,9.8,24.2s-2.1,14.4-4.6,22.2 S304.5,417.4,304.5,417.4z M172.9,131.2c0,0-6.2,4.6-5.2,12.4c1,7.7,11.9,43.3,11.9,43.3s7.7,14.4,10.3,13.9c2.6-0.5,16.5-6.2,16.5-6.2 s21.6,11.3,27.8,11.9s20.6-0.5,20.6-0.5s15.5,11.3,17,14.4s13.4,51.5,13.4,51.5s7.2,25.2,11.9,25.8c4.6,0.5,33.5-1,33.5-1 s14.4-8.2,16.5-11.3s10.3-19.1,10.3-19.1s27.8-3.1,34-6.7s31.4-25.2,31.4-25.2s11.3,2.6,14.4-1.5s4.1-13.4,4.1-13.4s10.8-27.3,8.8-35.6 c-2.1-8.2-2.1-23.7-2.1-23.7s-10.8-49-13.9-53.1s-21.6-18-21.6-18s-11.9-3.1-18-1s-36.6,14.4-36.6,14.4s-8.2,0.5-12.9-4.1 s-27.3-33-30.9-34.5s-46.9,8.2-46.9,8.2s-12.4,10.8-19.1,13.9s-14.4-1.5-14.4-1.5l-2.6,22.2l-22.2,2.1L172.9,131.2z" />
                    </svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '4px', color: color, opacity: 0.9 }}>aag</span>
                        <span style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--primary)' }}>o</span>
                    </div>
                    {showFoundation && (
                        <div style={{
                            letterSpacing: '6.5px', textTransform: 'uppercase', fontSize: '0.65rem',
                            fontWeight: 900, color: '#C69B00', marginTop: '-4px',
                            marginLeft: '4px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}>
                            foundation
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JaagoLogo;
