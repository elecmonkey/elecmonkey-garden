import Image from 'next/image';

interface TechIconProps {
  src: string;
  alt: string;
  label: string;
  className?: string;
  isGray?: boolean;
}

export default function TechIcon({ src, alt, label, className = '', isGray = false }: TechIconProps) {
  return (
    <div className="flex flex-col items-center group">
      <div className="relative w-16 h-16 mb-2">
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] ${isGray ? 'grayscale opacity-50' : ''} ${className}`}
        />
      </div>
      <span className="text-sm text-muted-foreground text-center w-full">{label}</span>
    </div>
  );
} 