
import { GraphStyle } from "../../types";

type GraphStyleOption = {
  value: GraphStyle;
  label: string;
};

export const graphStyleOptions: GraphStyleOption[] = [
  { value: "classic", label: "Classic" },
  { value: "natural", label: "Natural" },
  { value: "neon", label: "Neon" },
  { value: "pastel", label: "Pastel" },  
  { value: "monochrome", label: "Monochrome" },
  { value: "gradient", label: "Gradient" },
];
