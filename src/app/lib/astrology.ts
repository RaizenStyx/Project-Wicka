import { MakeTime, MoonPhase, GeoVector, Ecliptic, SearchMoonPhase, Body } from "astronomy-engine";

export interface MoonData {
  phaseName: string;      // e.g., "Waxing Gibbous"
  illumination: number;   // e.g., 95
  zodiacSign: string;     // e.g., "Taurus"
  emoji: string;          // 🌖
  nextPhase: string;      // "Full Moon"
  daysToNextPhase: number;// 3
}

const ZODIAC_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", 
  "Leo", "Virgo", "Libra", "Scorpio", 
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export function getMoonData(date: Date = new Date()): MoonData {
  const astroTime = MakeTime(date);

  // 1. Phase Angle (0-360)
  const phaseAngle = MoonPhase(astroTime);
  const { name, emoji } = getPhaseDetails(phaseAngle);

  // 2. Illumination %
  // Formula: (1 - cos(angle)) / 2 * 100
  const illumination = Math.round((1 - Math.cos(phaseAngle * Math.PI / 180)) / 2 * 100);

  // 3. Zodiac Sign
  // Get Moon's Geocentric Ecliptic Longitude
  const vec = GeoVector(Body.Moon, astroTime, true);
  const ecliptic = Ecliptic(vec); 
  const signIndex = Math.floor(ecliptic.elon / 30) % 12;
  const zodiacSign = ZODIAC_ORDER[signIndex];

  // 4. Next Major Phase Calculation
  // We search forward for the next standard phase (0, 90, 180, 270)
  const nextNew = SearchMoonPhase(0, date, 30);
  const nextFirst = SearchMoonPhase(90, date, 30);
  const nextFull = SearchMoonPhase(180, date, 30);
  const nextLast = SearchMoonPhase(270, date, 30);
  
  // Find the closest future date
  const phases = [
    { name: "New Moon", date: nextNew },
    { name: "First Quarter", date: nextFirst },
    { name: "Full Moon", date: nextFull },
    { name: "Last Quarter", date: nextLast }
  ].sort((a, b) => (a.date?.date.getTime() || 0) - (b.date?.date.getTime() || 0));

  const nextMajor = phases[0];
  const daysToNext = nextMajor.date 
    ? Math.ceil((nextMajor.date.date.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  return {
    phaseName: name,
    illumination,
    zodiacSign,
    emoji,
    nextPhase: nextMajor.name,
    daysToNextPhase: daysToNext
  };
}

function getPhaseDetails(angle: number) {
  // Normalize angle to 0-360
  const norm = (angle + 360) % 360;
  
  if (norm < 15 || norm > 345) return { name: "New Moon", emoji: "🌑" };
  if (norm < 75) return { name: "Waxing Crescent", emoji: "🌒" };
  if (norm < 105) return { name: "First Quarter", emoji: "🌓" };
  if (norm < 165) return { name: "Waxing Gibbous", emoji: "🌔" };
  if (norm < 195) return { name: "Full Moon", emoji: "🌕" };
  if (norm < 255) return { name: "Waning Gibbous", emoji: "🌖" };
  if (norm < 285) return { name: "Last Quarter", emoji: "🌗" };
  return { name: "Waning Crescent", emoji: "🌘" };
}