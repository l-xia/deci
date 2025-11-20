export interface CategoryData {
  name: string;
  color: string;
  description: string;
}

export interface CategoryColors {
  border: string;
  borderHover: string;
  bg: string;
  bgHover: string;
  highlight: string;
  text: string;
  ring: string;
}

export type CategoryKey = 'structure' | 'upkeep' | 'play' | 'default';
