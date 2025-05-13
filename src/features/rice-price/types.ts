
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";

// Form values for dialog components
export type PriceFormValues = {
  name: string;
  price: string;
  priceColor: string;
  document_date: string;
};

export type DocumentFormValues = {
  document_date: string;
  file_url: string;
};
