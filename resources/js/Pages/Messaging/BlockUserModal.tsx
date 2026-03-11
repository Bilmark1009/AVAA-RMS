import React, { useRef, useEffect } from 'react';

interface BlockUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    isProcessing?: boolean;
}

export default function BlockUserModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    userName,
    isProcessing = false 
}: BlockUserModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            ref={backdropRef}
            onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
            className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all"
        >
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[360px] overflow-hidden p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
                
                {/* Red Block Icon */}
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6 border border-red-100">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                </div>

                <h3 className="text-[20px] font-bold text-gray-900 mb-4">Blocked this Person</h3>
                
                <p className="text-[15px] text-gray-500 leading-relaxed mb-8 px-4">
                    Are you sure you want to blocked this Person?
                </p>

                <div className="w-full space-y-3">
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="w-full py-4 bg-[#86B0A9] hover:bg-[#76A099] active:bg-[#669089] text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : 'Blocked'}
                    </button>

                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full py-3 text-[15px] font-bold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}