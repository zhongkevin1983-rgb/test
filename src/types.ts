export interface CarSpecs {
  engine: string;
  horsepower: string;
  weight: string;
  topSpeed: string;
  championships: string;
  drivers: string[];
}

export interface Car {
  id: string;
  name: string;
  year: number;
  fullName: string;
  image: string;
  description: string;
  longDescription: string;
  chassis: string;
  specs: CarSpecs;
  audioType: 'v12' | 'v10' | 'v8' | 'v6';
  baseFreq: number;
  highlightColor: string;
  glbModel?: string;
  era: string;
  eraRange: string;
}
