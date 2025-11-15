import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface NewsSearchProps {
  onSearch: (searchTerm: string, dateFilter: string, categoryFilter: string) => void;
}

export const NewsSearch = ({ onSearch }: NewsSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleSearch = () => {
    onSearch(searchTerm, dateFilter, categoryFilter);
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="ابحث عن الأخبار، الكاتب..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearch(e.target.value, dateFilter, categoryFilter);
            }}
            className="w-full"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value);
            onSearch(searchTerm, dateFilter, value);
          }}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            <SelectItem value="فعاليات">فعاليات</SelectItem>
            <SelectItem value="إنجازات">إنجازات</SelectItem>
            <SelectItem value="إعلانات">إعلانات</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={dateFilter}
          onValueChange={(value) => {
            setDateFilter(value);
            onSearch(searchTerm, value, categoryFilter);
          }}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="فترة البحث" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأوقات</SelectItem>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="gap-2">
          <Search className="h-4 w-4" />
          بحث
        </Button>
      </div>
    </div>
  );
};
