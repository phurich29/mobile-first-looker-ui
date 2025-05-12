
import { Bell, Menu } from "lucide-react";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-crypto-c2etech text-white">
      <Button variant="ghost" size="icon" className="text-white">
        <Menu className="h-6 w-6" />
      </Button>
      
      <h1 className="text-xl font-semibold">Home</h1>
      
      <Button variant="ghost" size="icon" className="text-white">
        <Bell className="h-6 w-6" />
      </Button>
    </header>
  );
};
