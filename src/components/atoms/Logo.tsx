import Link from 'next/link';
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
            {showIcon && <span className="text-2xl">🧉</span>}
        </Link>
    );
};
