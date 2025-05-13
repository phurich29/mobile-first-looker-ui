
import { RicePrice, RicePriceDocument } from "@/features/user-management/types";

// Form values for dialog components
export type PriceFormValues = {
  name: string;
  price: string;
  priceColor: string; // Used for UI display only, not sent to database
  document_date: string;
};

export type DocumentFormValues = {
  document_date: string;
  file_url: string;
};
