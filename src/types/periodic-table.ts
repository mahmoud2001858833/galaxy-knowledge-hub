
export interface Element {
  name: string;
  symbol: string;
  atomic_number: number;
  group: number;
  period: number;
  type: ElementType;
  usage: string;
  state_at_room_temp?: "solid" | "liquid" | "gas";
  position?: { x: number; y: number };
}

export type ElementType = 
  | "alkali-metal" 
  | "alkaline-earth-metal" 
  | "transition-metal" 
  | "post-transition-metal" 
  | "metalloid" 
  | "nonmetal" 
  | "halogen" 
  | "noble-gas";

export interface ElementGrouping {
  name: string;
  type: ElementType;
  color: string;
}

export const elementGroups: ElementGrouping[] = [
  { name: "الفلزات القلوية", type: "alkali-metal", color: "bg-red-500/70" },
  { name: "الفلزات القلوية الترابية", type: "alkaline-earth-metal", color: "bg-orange-500/70" },
  { name: "الفلزات الانتقالية", type: "transition-metal", color: "bg-yellow-500/70" },
  { name: "الفلزات بعد الانتقالية", type: "post-transition-metal", color: "bg-green-400/70" },
  { name: "أشباه الفلزات", type: "metalloid", color: "bg-emerald-500/70" },
  { name: "اللافلزات", type: "nonmetal", color: "bg-blue-500/70" },
  { name: "الهالوجينات", type: "halogen", color: "bg-indigo-500/70" },
  { name: "الغازات النبيلة", type: "noble-gas", color: "bg-purple-500/70" },
];
