// ─── SHIPPING ZONES ──────────────────────────────────────────────────────────
// Zone 1: Región Metropolitana
// Zone 2: V, VI, VII, VIII (zonas centrales)
// Zone 3: IX, X, XIV (sur)
// Zone 4: I, II, III, IV, XI, XII, XV, XVI (extremos)

const ZONE_MAP: Record<string, 1 | 2 | 3 | 4> = {
  "Región Metropolitana":  1,
  "Valparaíso":            2,
  "O'Higgins":             2,
  "Maule":                 2,
  "Ñuble":                 2,
  "Biobío":                2,
  "La Araucanía":          3,
  "Los Ríos":              3,
  "Los Lagos":             3,
  "Coquimbo":              2,
  "Atacama":               4,
  "Antofagasta":           4,
  "Tarapacá":              4,
  "Arica y Parinacota":    4,
  "Aysén":                 4,
  "Magallanes":            4,
};

export type Carrier = "STARKEN" | "CHILEXPRESS" | "BLUE_EXPRESS" | "PICKUP";

export interface ShippingOption {
  carrier: Carrier;
  label: string;
  days: string;
  price: number;
}

// Prices in CLP
const RATES: Record<1 | 2 | 3 | 4, Partial<Record<Carrier, number>>> = {
  1: { STARKEN: 3990,  CHILEXPRESS: 3490,  BLUE_EXPRESS: 4490, PICKUP: 0 },
  2: { STARKEN: 5990,  CHILEXPRESS: 5490,  PICKUP: 0 },
  3: { STARKEN: 7990,  CHILEXPRESS: 7490,  PICKUP: 0 },
  4: { STARKEN: 10990, CHILEXPRESS: 9990,  PICKUP: 0 },
};

const CARRIER_META: Record<Carrier, { label: string; days: string }> = {
  STARKEN:      { label: "Starken",           days: "2-4 días hábiles" },
  CHILEXPRESS:  { label: "Chilexpress",        days: "3-5 días hábiles" },
  BLUE_EXPRESS: { label: "Blue Express",       days: "1-2 días hábiles (RM)" },
  PICKUP:       { label: "Retiro en tienda",   days: "Disponible al día siguiente" },
};

export function getShippingOptions(region: string): ShippingOption[] {
  const zone = ZONE_MAP[region] ?? 4;
  const rates = RATES[zone];

  return (Object.entries(rates) as [Carrier, number][]).map(([carrier, price]) => ({
    carrier,
    price,
    label: CARRIER_META[carrier].label,
    days: CARRIER_META[carrier].days,
  }));
}

export function getZone(region: string): 1 | 2 | 3 | 4 {
  return ZONE_MAP[region] ?? 4;
}
