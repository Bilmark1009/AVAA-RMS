import { useState } from 'react';

interface ImageInitialsFallbackProps {
    src?: string | null;
    alt: string;
    initials: string;
    className: string;
    textClassName?: string;
    fallbackClassName?: string;
    imgClassName?: string;
}

export default function ImageInitialsFallback({
    src,
    alt,
    initials,
    className,
    textClassName = 'text-white font-bold',
    fallbackClassName = 'bg-avaa-dark flex items-center justify-center',
    imgClassName = 'w-full h-full object-cover',
}: ImageInitialsFallbackProps) {
    const [hasError, setHasError] = useState(false);
    const showImage = Boolean(src) && !hasError;

    return (
        <div className={className}>
            {showImage ? (
                <img
                    src={src as string}
                    alt={alt}
                    className={imgClassName}
                    onError={() => setHasError(true)}
                    loading="lazy"
                />
            ) : (
                <span className={`${textClassName} ${fallbackClassName} w-full h-full`}>
                    {initials}
                </span>
            )}
        </div>
    );
}
