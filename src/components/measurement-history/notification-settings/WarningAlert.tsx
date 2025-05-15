
import { AlertTriangle } from "lucide-react";

interface WarningAlertProps {
  visible: boolean;
  message: string;
}

export const WarningAlert = ({ visible, message }: WarningAlertProps) => {
  if (!visible) return null;
  
  return (
    <div className="bg-yellow-50 p-3 rounded-md flex gap-2 items-start">
      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-yellow-700">{message}</p>
    </div>
  );
};

export default WarningAlert;
