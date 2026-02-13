import React, { useState, useEffect, useRef } from 'react';
import AIBabaChat from './AIBabaChat';
import './AIBabaStyles.css';

interface AIBabaProps {
    forceOpen?: boolean;
    onToggle?: () => void;
    role?: string;
    onCommand?: (command: string, data?: any) => void;
}

const AIBaba: React.FC<AIBabaProps> = ({ forceOpen, onToggle, role, onCommand }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (forceOpen) {
            setIsOpen(true);
            setIsMinimized(false);
        }
    }, [forceOpen]);
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Relative to initial position
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // AI Baba Image Path (Assuming user will put it here or I'll generate one)
    const iconUrl = '/ai-baba.png';

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isOpen && !isMinimized) return; // Don't drag if chat is fully open
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleClick = () => {
        if (isDragging) return;

        // If minimized, restore. If closed, open.
        if (isMinimized) {
            setIsMinimized(false);
            setIsOpen(true);
        } else {
            setIsOpen(!isOpen);
        }

        onToggle?.();
    };

    return (
        <>
            <div
                ref={containerRef}
                className="ai-baba-container"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    display: (isOpen && !isMinimized) ? 'none' : 'flex'
                }}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                <img
                    src={iconUrl}
                    alt="AI Baba"
                    className="ai-baba-icon"
                    onError={(e) => {
                        // Fallback if image not found
                        (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=AIBaba&backgroundColor=f5c518';
                    }}
                />
            </div>

            {isOpen && !isMinimized && (
                <AIBabaChat
                    role={role}
                    onCommand={onCommand}
                    onClose={() => setIsOpen(false)}
                    onMinimize={() => setIsMinimized(true)}
                />
            )}
        </>
    );
};

export default AIBaba;
