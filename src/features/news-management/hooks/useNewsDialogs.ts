
import { useState } from "react";

export function useNewsDialogs() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  return {
    dialogOpen,
    setDialogOpen,
    previewDialogOpen,
    setPreviewDialogOpen
  };
}
