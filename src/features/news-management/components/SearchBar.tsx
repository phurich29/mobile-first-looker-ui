
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  return (
    <div className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
      <Input
        placeholder="ค้นหาข่าวสาร..."
        className="pl-10 border-gray-200 focus-within:border-emerald-300 focus-within:ring-1 focus-within:ring-emerald-300 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:placeholder-gray-500 dark:focus-within:border-emerald-500 dark:focus-within:ring-emerald-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
