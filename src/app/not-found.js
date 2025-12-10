import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center overflow-hidden">
            <div className="max-w-4xl w-full animate-[fadeIn_0.5s_ease-in-out]">
                <div className="relative flex justify-center w-full">
                    <img
                        src="/Gemini_Generated_Image_e3yjyre3yjyre3yj.png"
                        alt="Página no encontrada"
                        className="w-full h-auto object-cover mask-image-b"
                        style={{
                            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
                        }}
                    />
                </div>

                <div className="-mt-32 md:-mt-48 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#1a1a1a] mb-4 drop-shadow-sm">
                        ¡Ups!
                    </h1>

                    <p className="text-lg md:text-xl text-stone-600 mb-8 max-w-md mx-auto">
                        Parece que el mate se lavó... No pudimos encontrar la página que estabas buscando.
                    </p>

                    <Link href="/">
                        <Button className="bg-[#1a1a1a] hover:bg-stone-800 text-white px-8 py-3 rounded-full inline-flex items-center gap-2 transition-all hover:gap-3 shadow-lg">
                            <ArrowLeft size={20} />
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
