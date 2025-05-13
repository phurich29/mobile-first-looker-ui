import { useState } from "react";
import { PriceFormValues, DocumentFormValues } from "../../types";

export function usePriceFormState() {
  // Initialize with today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // States for price form
  const [priceFormValues, setPriceFormValues] = useState<PriceFormValues>({
    name: '',
    price: '',
    priceColor: 'black',
    document_date: today
  });

  // States for document form
  const [docFormValues, setDocFormValues] = useState<DocumentFormValues>({
    document_date: today,
    file_url: ''
  });

  // Handle rice price form input changes
  const handlePriceFormChange = (field: keyof PriceFormValues, value: string) => {
    console.log(`Updating price form field ${field} to:`, value);
    setPriceFormValues({
      ...priceFormValues,
      [field]: value
    });
  };

  // Handle document form input changes
  const handleDocFormChange = (field: keyof DocumentFormValues, value: string) => {
    console.log(`Updating document form field ${field} to:`, value);
    setDocFormValues({
      ...docFormValues,
      [field]: value
    });
  };

  // Reset price form values (keeping the date)
  const resetPriceForm = () => {
    // Keep the current document_date value
    const currentDate = priceFormValues.document_date;
    
    console.log('Resetting price form, keeping date:', currentDate);
    setPriceFormValues({
      name: '',
      price: '',
      priceColor: 'black',
      document_date: currentDate // Preserve the date value
    });
  };

  // Reset document form values
  const resetDocForm = () => {
    console.log('Resetting document form');
    setDocFormValues({
      document_date: new Date().toISOString().split('T')[0],
      file_url: ''
    });
  };

  return {
    priceFormValues,
    docFormValues,
    handlePriceFormChange,
    handleDocFormChange,
    resetPriceForm,
    resetDocForm,
    setPriceFormValues
  };
}
