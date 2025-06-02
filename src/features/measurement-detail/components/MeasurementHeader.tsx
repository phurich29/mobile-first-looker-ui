
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeasurementHeaderProps {
  measurementName: string | undefined;
  measurementSymbol: string | undefined;
}

export const MeasurementHeader: React.FC<MeasurementHeaderProps> = ({
  measurementName,
  measurementSymbol
}) => {
  return (
    <div className="flex items-center mb-6">
      <h1 className="text-2xl font-bold text-emerald-800">
        {measurementName || measurementSymbol}
      </h1>
    </div>
  );
};
