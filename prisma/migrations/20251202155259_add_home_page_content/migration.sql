-- CreateTable
CREATE TABLE "home_page_content" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroTitle" TEXT NOT NULL DEFAULT 'MATETÉ',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'El ritual de cada día',
    "heroButtonText" TEXT NOT NULL DEFAULT 'Ver Colección',
    "heroImage" TEXT,
    "aboutTitle" TEXT NOT NULL DEFAULT 'Sobre Nosotros',
    "aboutText" TEXT NOT NULL DEFAULT 'Nacimos en Resistencia, Chaco, con la misión de revalorizar el ritual del mate.',
    "aboutImage1" TEXT,
    "aboutImage2" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_page_content_pkey" PRIMARY KEY ("id")
);
