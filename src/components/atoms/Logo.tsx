import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Typography } from '../atoms/Typography';

interface LogoProps {
    className?: string;
    showIcon?: boolean;
}

export const Logo = ({ className, showIcon = true }: LogoProps) => {
    return (
        <Link href="/" className={cn("text-2xl font-serif font-bold tracking-wider cursor-pointer flex items-center gap-2", className)}>
            <Typography variant="h3" className="mb-0 leading-none">MATETÉ</Typography>
            {showIcon && (
                <Image
                    src="/icon.png"
                    alt="Mateté Icon"
                    width={32}
                    height={32}
                    className="rounded-sm" // Optional: adds a slight cleanup if it's square
                />
            )}
        </Link>
    );
};
