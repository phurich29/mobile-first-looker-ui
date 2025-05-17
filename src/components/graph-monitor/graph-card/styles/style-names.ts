
import { GraphStyle } from "../../types";

type GraphStyleOption = {
  value: GraphStyle;
  label: string;
};

export const graphStyleOptions: GraphStyleOption[] = [
  { value: "classic", label: "ดั้งเดิม" },
  { value: "natural", label: "ธรรมชาติ" },
  { value: "neon", label: "นีออน" },
  { value: "pastel", label: "พาสเทล" },  
  { value: "monochrome", label: "ขาวดำ" },
  { value: "gradient", label: "ไล่ระดับ" },
];
