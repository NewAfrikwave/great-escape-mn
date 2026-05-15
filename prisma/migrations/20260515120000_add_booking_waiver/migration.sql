ALTER TABLE "Booking"
ADD COLUMN "waiverAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "waiverSignature" TEXT,
ADD COLUMN "waiverAcceptedAt" TIMESTAMP(3),
ADD COLUMN "waiverTextVersion" TEXT;
