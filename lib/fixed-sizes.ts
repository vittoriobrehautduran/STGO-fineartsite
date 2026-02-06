// Fixed sizes for fine art prints (in cm)
// Market-based prices for Chilean fine art printing

export interface FixedSize {
  width: number;
  height: number;
  unit: "cm";
  label: string;
  basePrice: number; // Base print price in CLP
}

export const FIXED_SIZES: FixedSize[] = [
  {
    width: 20,
    height: 30,
    unit: "cm",
    label: "20x30 cm",
    basePrice: 20000, // ~20,000 CLP
  },
  {
    width: 30,
    height: 40,
    unit: "cm",
    label: "30x40 cm",
    basePrice: 35000, // ~35,000 CLP
  },
  {
    width: 40,
    height: 60,
    unit: "cm",
    label: "40x60 cm",
    basePrice: 55000, // ~55,000 CLP
  },
  {
    width: 50,
    height: 70,
    unit: "cm",
    label: "50x70 cm",
    basePrice: 95000, // ~95,000 CLP
  },
  {
    width: 60,
    height: 90,
    unit: "cm",
    label: "60x90 cm",
    basePrice: 160000, // ~160,000 CLP
  },
];

// Calculate frame price based on print size
// Frame prices are proportional to the print size
export function calculateFramePrice(
  frameName: string,
  printPrice: number
): number {
  // Sin Marco is always free
  if (frameName === "Sin Marco" || frameName.toLowerCase().includes("sin marco")) {
    return 0;
  }

  // Calculate frame price as percentage of print price based on frame type
  const frameMultipliers: Record<string, number> = {
    "Marco de Madera Natural": 0.45, // 45% of print price
    "Marco Negro Clásico": 0.40, // 40% of print price
    "Marco Metálico Moderno": 0.35, // 35% of print price
    "Plateado": 0.38, // 38% of print price
    "Dorado": 0.50, // 50% of print price (premium)
    "Blanco": 0.35, // 35% of print price
  };

  const multiplier = frameMultipliers[frameName] || 0.40; // Default 40%
  return Math.round(printPrice * multiplier);
}


