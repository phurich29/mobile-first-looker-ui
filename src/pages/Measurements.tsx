
import { Header } from "@/components/Header";
import { MeasurementItem } from "@/components/MeasurementItem";
import { FooterNav } from "@/components/FooterNav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useState, useEffect } from "react";
import { Square, Wheat, Blend, Circle, Search, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function Measurements() {
  // สร้าง state และ ref สำหรับฟังก์ชันการลาก (Drag)
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // ฟังก์ชันจัดการการลาก (Drag)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabsContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - tabsContainerRef.current.offsetLeft);
    setScrollLeft(tabsContainerRef.current.scrollLeft);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!tabsContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - tabsContainerRef.current.offsetLeft);
    setScrollLeft(tabsContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !tabsContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // เพิ่มความเร็วในการเลื่อน
    tabsContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !tabsContainerRef.current) return;
    
    const x = e.touches[0].pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // เพิ่ม event listeners เมื่อ component mount
  useEffect(() => {
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
    return () => {
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  // สร้าง state สำหรับรหัสอุปกรณ์
  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rice_quality_analysis')
        .select('device_code')
        .not('device_code', 'is', null)
        .not('device_code', 'eq', '')
        .order('device_code', { ascending: true });

      if (error) {
        console.error('Error fetching devices:', error);
        return [];
      }
      
      // Get unique device codes
      const uniqueDevices = data ? [...new Set(data.map(item => item.device_code))] : [];
      return uniqueDevices.map(device_code => ({ device_code }));
    },
  });

  // ดึงข้อมูลพื้นข้าวเต็มเมล็ดจาก Supabase
  const fetchWholeGrainData = async () => {
    let query = supabase
      .from('rice_quality_analysis')
      .select('id, class1, class2, class3, short_grain, slender_kernel, created_at, thai_datetime, device_code')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (selectedDevice) {
      query = query.eq('device_code', selectedDevice);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching whole grain data:', error);
      throw new Error(error.message);
    }
    
    return data;
  };

  // ดึงข้อมูลส่วนผสมข้าวจาก Supabase
  const fetchIngredientsData = async () => {
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select('id, whole_kernels, head_rice, total_brokens, small_brokens, small_brokens_c1, created_at, thai_datetime')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching ingredients data:', error);
      throw new Error(error.message);
    }
    
    return data;
  };

  // ดึงข้อมูลสิ่งเจือปนจาก Supabase
  const fetchImpuritiesData = async () => {
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select('id, red_line_rate, parboiled_red_line, parboiled_white_rice, honey_rice, yellow_rice_rate, black_kernel, partly_black_peck, partly_black, imperfection_rate, sticky_rice_rate, impurity_num, paddy_rate, whiteness, process_precision, created_at, thai_datetime')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching impurities data:', error);
      throw new Error(error.message);
    }
    
    return data;
  };

  // ดึงข้อมูลทั้งหมดจาก Supabase สำหรับแท็บ "ทั้งหมด"
  const fetchAllData = async () => {
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching all data:', error);
      throw new Error(error.message);
    }
    
    return data;
  };

  // ใช้ React Query สำหรับดึงข้อมูล
  const { data: wholeGrainData, isLoading: isLoadingWholeGrain } = useQuery({
    queryKey: ['wholeGrainData', selectedDevice],
    queryFn: fetchWholeGrainData,
  });

  const { data: ingredientsData, isLoading: isLoadingIngredients } = useQuery({
    queryKey: ['ingredientsData'],
    queryFn: fetchIngredientsData,
  });
  
  const { data: impuritiesData, isLoading: isLoadingImpurities } = useQuery({
    queryKey: ['impuritiesData'],
    queryFn: fetchImpuritiesData,
  });
  
  const { data: allData, isLoading: isLoadingAllData } = useQuery({
    queryKey: ['allData'],
    queryFn: fetchAllData,
  });

  // กรองข้อมูลตามคำค้นหา
  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้กับ MeasurementItem และคำนวณการเปลี่ยนแปลง
  const formatWholeGrainItems = () => {
    if (!wholeGrainData || wholeGrainData.length === 0) return [];
    
    // คำนวณการเปลี่ยนแปลงโดยเปรียบเทียบค่าล่าสุดกับค่าก่อนหน้า
    const calculateChange = (current: number | null, previous: number | null) => {
      if (current === null || previous === null) return 0;
      return current - previous;
    };
    
    // ข้อมูลล่าสุดและข้อมูลก่อนหน้า
    const latestData = wholeGrainData[0];
    const previousData = wholeGrainData.length > 1 ? wholeGrainData[1] : null;
    
    // แปลงข้อมูลเป็นรูปแบบของ MeasurementItem
    const metrics = [
      {
        symbol: "class1",
        name: "ชั้น 1 (>7.0mm)",
        price: latestData.class1?.toString() || "0",
        percentageChange: calculateChange(latestData.class1, previousData?.class1),
        iconColor: "#F7931A",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "class2",
        name: "ชั้น 2 (>6.6-7.0mm)",
        price: latestData.class2?.toString() || "0",
        percentageChange: calculateChange(latestData.class2, previousData?.class2),
        iconColor: "#627EEA",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "class3",
        name: "ชั้น 3 (>6.2-6.6mm)",
        price: latestData.class3?.toString() || "0",
        percentageChange: calculateChange(latestData.class3, previousData?.class3),
        iconColor: "#F3BA2F",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "short_grain",
        name: "เมล็ดสั้น",
        price: latestData.short_grain?.toString() || "0",
        percentageChange: calculateChange(latestData.short_grain, previousData?.short_grain),
        iconColor: "#23292F",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "slender_kernel",
        name: "ข้าวลีบ",
        price: latestData.slender_kernel?.toString() || "0",
        percentageChange: calculateChange(latestData.slender_kernel, previousData?.slender_kernel),
        iconColor: "#345D9D",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
    ];

    return metrics;
  };

  // แปลงข้อ���ูลส่วนผสมให้อยู่ในรูปแบบที่ใช้กับ MeasurementItem และคำนวณการเปลี่ยนแปลง
  const formatIngredientsItems = () => {
    if (!ingredientsData || ingredientsData.length === 0) return [];
    
    // คำนวณการเปลี่ยนแปลงโดยเปรียบเทียบค่าล่าสุดกับค่าก่อนหน้า
    const calculateChange = (current: number | null, previous: number | null) => {
      if (current === null || previous === null) return 0;
      return current - previous;
    };
    
    // ข้อมูลล่าสุดและข้อมูลก่อนหน้า
    const latestData = ingredientsData[0];
    const previousData = ingredientsData.length > 1 ? ingredientsData[1] : null;
    
    // แปลงข้อมูลเป็นรูปแบบของ MeasurementItem
    const metrics = [
      {
        symbol: "whole_kernels",
        name: "เต็มเมล็ด",
        price: latestData.whole_kernels?.toString() || "0",
        percentageChange: calculateChange(latestData.whole_kernels, previousData?.whole_kernels),
        iconColor: "#4CAF50",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "head_rice",
        name: "ต้นข้าว",
        price: latestData.head_rice?.toString() || "0",
        percentageChange: calculateChange(latestData.head_rice, previousData?.head_rice),
        iconColor: "#2196F3",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "total_brokens",
        name: "ข้าวหักรวม",
        price: latestData.total_brokens?.toString() || "0",
        percentageChange: calculateChange(latestData.total_brokens, previousData?.total_brokens),
        iconColor: "#FF9800",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "small_brokens",
        name: "ปลายข้าว",
        price: latestData.small_brokens?.toString() || "0",
        percentageChange: calculateChange(latestData.small_brokens, previousData?.small_brokens),
        iconColor: "#9C27B0",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "small_brokens_c1",
        name: "ปลายข้าวC1",
        price: latestData.small_brokens_c1?.toString() || "0",
        percentageChange: calculateChange(latestData.small_brokens_c1, previousData?.small_brokens_c1),
        iconColor: "#795548",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
    ];

    return metrics;
  };

  // แปลงข้อมูลสิ่งเจือปนให้อยู่ในรูปแบบที่ใช้กับ MeasurementItem และคำนวณการเปลี่ยนแปลง
  const formatImpuritiesItems = () => {
    if (!impuritiesData || impuritiesData.length === 0) return [];
    
    // คำนวณการเปลี่ยนแป���งโดยเปรียบเทียบค่าล่าสุดกับค่าก่อนหน้า
    const calculateChange = (current: number | null, previous: number | null) => {
      if (current === null || previous === null) return 0;
      return current - previous;
    };
    
    // ข้อมูลล่าสุดและข้อมูลก่อนหน้า
    const latestData = impuritiesData[0];
    const previousData = impuritiesData.length > 1 ? impuritiesData[1] : null;
    
    // แปลงข้อมูลเป็นรูปแบบของ MeasurementItem
    const metrics = [
      {
        symbol: "red_line_rate",
        name: "สีต่ำกว่ามาตรฐาน",
        price: latestData.red_line_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.red_line_rate, previousData?.red_line_rate),
        iconColor: "#9b87f5",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "parboiled_red_line",
        name: "เมล็ดแดง",
        price: latestData.parboiled_red_line?.toString() || "0",
        percentageChange: calculateChange(latestData.parboiled_red_line, previousData?.parboiled_red_line),
        iconColor: "#7E69AB",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "parboiled_white_rice",
        name: "ข้าวดิบ",
        price: latestData.parboiled_white_rice?.toString() || "0",
        percentageChange: calculateChange(latestData.parboiled_white_rice, previousData?.parboiled_white_rice),
        iconColor: "#6E59A5",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "honey_rice",
        name: "เมล็ดม่วง",
        price: latestData.honey_rice?.toString() || "0",
        percentageChange: calculateChange(latestData.honey_rice, previousData?.honey_rice),
        iconColor: "#D946EF",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "yellow_rice_rate",
        name: "เมล็ดเหลือง",
        price: latestData.yellow_rice_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.yellow_rice_rate, previousData?.yellow_rice_rate),
        iconColor: "#F3BA2F",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "black_kernel",
        name: "เมล็ดดำ",
        price: latestData.black_kernel?.toString() || "0",
        percentageChange: calculateChange(latestData.black_kernel, previousData?.black_kernel),
        iconColor: "#1A1F2C",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "partly_black_peck",
        name: "ดำบางส่วน & จุดดำ",
        price: latestData.partly_black_peck?.toString() || "0",
        percentageChange: calculateChange(latestData.partly_black_peck, previousData?.partly_black_peck),
        iconColor: "#403E43",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "partly_black",
        name: "ดำบางส่วน",
        price: latestData.partly_black?.toString() || "0",
        percentageChange: calculateChange(latestData.partly_black, previousData?.partly_black),
        iconColor: "#221F26",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "imperfection_rate",
        name: "เมล็ดเสีย",
        price: latestData.imperfection_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.imperfection_rate, previousData?.imperfection_rate),
        iconColor: "#F97316",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "sticky_rice_rate",
        name: "ข้าวเหนียว",
        price: latestData.sticky_rice_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.sticky_rice_rate, previousData?.sticky_rice_rate),
        iconColor: "#0EA5E9",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "impurity_num",
        name: "เมล็ดอื่นๆ",
        price: latestData.impurity_num?.toString() || "0",
        percentageChange: calculateChange(latestData.impurity_num, previousData?.impurity_num),
        iconColor: "#8B5CF6",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "paddy_rate",
        name: "ข้าวเปลือก(เมล็ด/กก.)",
        price: latestData.paddy_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.paddy_rate, previousData?.paddy_rate),
        iconColor: "#8E9196",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "whiteness",
        name: "ความขาว",
        price: latestData.whiteness?.toString() || "0",
        percentageChange: calculateChange(latestData.whiteness, previousData?.whiteness),
        iconColor: "#C8C8C9",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "process_precision",
        name: "ระดับขัดสี",
        price: latestData.process_precision?.toString() || "0",
        percentageChange: calculateChange(latestData.process_precision, previousData?.process_precision),
        iconColor: "#9F9EA1",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
    ];

    return metrics;
  };

  // รวมข้อมูลทั้งสามประเภทเพื่อแสดงในแท็บ "ทั้งหมด"
  const formatAllItems = () => {
    if (!allData || allData.length === 0) return [];
    
    // คำนวณการเปลี่ยนแปลงโดยเปรียบเทียบค่าล่าสุดกับค่าก่อนหน้า
    const calculateChange = (current: number | null, previous: number | null) => {
      if (current === null || previous === null) return 0;
      return current - previous;
    };
    
    // ข้อมูลล่าสุดและข้อมูลก่อนหน้า
    const latestData = allData[0];
    const previousData = allData.length > 1 ? allData[1] : null;
    
    // รวมข้อมูลทั้งสามประเภทเข้าด้วยกัน
    const metrics = [
      // หมวดหมู่ "พื้นข้าวเต็มเมล็ด"
      {
        symbol: "class1",
        name: "ชั้น 1 (>7.0mm)",
        price: latestData.class1?.toString() || "0",
        percentageChange: calculateChange(latestData.class1, previousData?.class1),
        iconColor: "#F7931A",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "class2",
        name: "ชั้น 2 (>6.6-7.0mm)",
        price: latestData.class2?.toString() || "0",
        percentageChange: calculateChange(latestData.class2, previousData?.class2),
        iconColor: "#627EEA",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "class3",
        name: "ชั้น 3 (>6.2-6.6mm)",
        price: latestData.class3?.toString() || "0",
        percentageChange: calculateChange(latestData.class3, previousData?.class3),
        iconColor: "#F3BA2F",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "short_grain",
        name: "เมล็ดสั้น",
        price: latestData.short_grain?.toString() || "0",
        percentageChange: calculateChange(latestData.short_grain, previousData?.short_grain),
        iconColor: "#23292F",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "slender_kernel",
        name: "ข้าวลีบ",
        price: latestData.slender_kernel?.toString() || "0",
        percentageChange: calculateChange(latestData.slender_kernel, previousData?.slender_kernel),
        iconColor: "#345D9D",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      
      // หมวดหมู่ "ส่วนผสม"
      {
        symbol: "whole_kernels",
        name: "เต็มเมล็ด",
        price: latestData.whole_kernels?.toString() || "0",
        percentageChange: calculateChange(latestData.whole_kernels, previousData?.whole_kernels),
        iconColor: "#4CAF50",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "head_rice",
        name: "ต้นข้าว",
        price: latestData.head_rice?.toString() || "0",
        percentageChange: calculateChange(latestData.head_rice, previousData?.head_rice),
        iconColor: "#2196F3",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "total_brokens",
        name: "ข้าวหักรวม",
        price: latestData.total_brokens?.toString() || "0",
        percentageChange: calculateChange(latestData.total_brokens, previousData?.total_brokens),
        iconColor: "#FF9800",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "small_brokens",
        name: "ปลายข้าว",
        price: latestData.small_brokens?.toString() || "0",
        percentageChange: calculateChange(latestData.small_brokens, previousData?.small_brokens),
        iconColor: "#9C27B0",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "small_brokens_c1",
        name: "ปลายข้าวC1",
        price: latestData.small_brokens_c1?.toString() || "0",
        percentageChange: calculateChange(latestData.small_brokens_c1, previousData?.small_brokens_c1),
        iconColor: "#795548",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      
      // หมวดหมู่ "สิ่งเจือปน"
      {
        symbol: "red_line_rate",
        name: "สีต่ำกว่ามาตรฐาน",
        price: latestData.red_line_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.red_line_rate, previousData?.red_line_rate),
        iconColor: "#9b87f5",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "parboiled_red_line",
        name: "เมล็ดแดง",
        price: latestData.parboiled_red_line?.toString() || "0",
        percentageChange: calculateChange(latestData.parboiled_red_line, previousData?.parboiled_red_line),
        iconColor: "#7E69AB",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "parboiled_white_rice",
        name: "ข้าวดิบ",
        price: latestData.parboiled_white_rice?.toString() || "0",
        percentageChange: calculateChange(latestData.parboiled_white_rice, previousData?.parboiled_white_rice),
        iconColor: "#6E59A5",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "honey_rice",
        name: "เมล็ดม่วง",
        price: latestData.honey_rice?.toString() || "0",
        percentageChange: calculateChange(latestData.honey_rice, previousData?.honey_rice),
        iconColor: "#D946EF",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "yellow_rice_rate",
        name: "เมล็ดเหลือง",
        price: latestData.yellow_rice_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.yellow_rice_rate, previousData?.yellow_rice_rate),
        iconColor: "#F3BA2F",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "black_kernel",
        name: "เมล็ดดำ",
        price: latestData.black_kernel?.toString() || "0",
        percentageChange: calculateChange(latestData.black_kernel, previousData?.black_kernel),
        iconColor: "#1A1F2C",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "partly_black_peck",
        name: "ดำบางส่วน & จุดดำ",
        price: latestData.partly_black_peck?.toString() || "0",
        percentageChange: calculateChange(latestData.partly_black_peck, previousData?.partly_black_peck),
        iconColor: "#403E43",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "partly_black",
        name: "ดำบางส่วน",
        price: latestData.partly_black?.toString() || "0",
        percentageChange: calculateChange(latestData.partly_black, previousData?.partly_black),
        iconColor: "#221F26",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "imperfection_rate",
        name: "เมล็ดเสีย",
        price: latestData.imperfection_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.imperfection_rate, previousData?.imperfection_rate),
        iconColor: "#F97316",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "sticky_rice_rate",
        name: "ข้าวเหนียว",
        price: latestData.sticky_rice_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.sticky_rice_rate, previousData?.sticky_rice_rate),
        iconColor: "#0EA5E9",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "impurity_num",
        name: "เมล็ดอื่นๆ",
        price: latestData.impurity_num?.toString() || "0",
        percentageChange: calculateChange(latestData.impurity_num, previousData?.impurity_num),
        iconColor: "#8B5CF6",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "paddy_rate",
        name: "ข้าวเปลือก(เมล็ด/กก.)",
        price: latestData.paddy_rate?.toString() || "0",
        percentageChange: calculateChange(latestData.paddy_rate, previousData?.paddy_rate),
        iconColor: "#8E9196",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "whiteness",
        name: "ความขาว",
        price: latestData.whiteness?.toString() || "0",
        percentageChange: calculateChange(latestData.whiteness, previousData?.whiteness),
        iconColor: "#C8C8C9",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
      {
        symbol: "process_precision",
        name: "ระดับขัดสี",
        price: latestData.process_precision?.toString() || "0",
        percentageChange: calculateChange(latestData.process_precision, previousData?.process_precision),
        iconColor: "#9F9EA1",
        updatedAt: new Date(latestData.created_at || latestData.thai_datetime)
      },
    ];

    return metrics;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 md:ml-64">
      <Header />

      <main className="flex-1 pb-28">
        {/* แถบค้นหาและเลือกอุปกรณ์ */}
        <div className="flex items-center justify-between p-4 gap-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
            />
          </div>
          
          <div className="min-w-[180px]">
            <Select 
              value={selectedDevice || undefined} 
              onValueChange={(value) => setSelectedDevice(value || null)}
            >
              <SelectTrigger className="h-10 bg-white border-gray-200">
                <SelectValue placeholder="เลือกอุปกรณ์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกอุปกรณ์</SelectItem>
                {devices?.map((device) => (
                  <SelectItem key={device.device_code} value={device.device_code}>
                    {device.device_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* แท็บสำหรับเลือกประเภท */}
        <div className="mb-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="relative w-full overflow-hidden">
              <div 
                ref={tabsContainerRef}
                className="w-full overflow-x-auto pb-3 no-scrollbar"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <TabsList 
                  className="flex min-w-max h-12 bg-white border-y border-gray-200 p-1 space-x-1 overflow-visible"
                  style={{ paddingLeft: '0.25rem', paddingRight: '0.25rem' }}
                >
                  <TabsTrigger 
                    value="all" 
                    className="whitespace-nowrap min-w-[100px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Square className="h-4 w-4 flex-shrink-0" />
                    <span>ทั้งหมด</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="wholegrain" 
                    className="whitespace-nowrap min-w-[160px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Wheat className="h-4 w-4 flex-shrink-0" />
                    <span>พื้นข้าวเต็มเมล็ด (%)</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ingredients" 
                    className="whitespace-nowrap min-w-[130px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Blend className="h-4 w-4 flex-shrink-0" />
                    <span>ส่วนผสม (%)</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="impurities" 
                    className="whitespace-nowrap min-w-[130px] flex items-center justify-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md px-4"
                  >
                    <Circle className="h-4 w-4 flex-shrink-0" />
                    <span>สิ่งเจือปน (%)</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-4">
              {/* รายการการวัดทั้งหมด */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {isLoadingAllData ? (
                  <div className="flex justify-center items-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : formatAllItems().length > 0 ? (
                  filterItems(formatAllItems()).map((item, index) => (
                    <MeasurementItem
                      key={index}
                      symbol={item.symbol}
                      name={item.name}
                      price={item.price}
                      percentageChange={item.percentageChange}
                      iconColor={item.iconColor}
                      updatedAt={item.updatedAt}
                    />
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    ไม่พบข้อมูล
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="wholegrain" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {isLoadingWholeGrain ? (
                  <div className="flex justify-center items-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : formatWholeGrainItems().length > 0 ? (
                  filterItems(formatWholeGrainItems()).map((item, index) => (
                    <MeasurementItem
                      key={index}
                      symbol={item.symbol}
                      name={item.name}
                      price={item.price}
                      percentageChange={item.percentageChange}
                      iconColor={item.iconColor}
                      updatedAt={item.updatedAt}
                    />
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    ไม่พบข้อมูลพื้นข้าวเต็มเมล็ด
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="ingredients" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {isLoadingIngredients ? (
                  <div className="flex justify-center items-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : formatIngredientsItems().length > 0 ? (
                  filterItems(formatIngredientsItems()).map((item, index) => (
                    <MeasurementItem
                      key={index}
                      symbol={item.symbol}
                      name={item.name}
                      price={item.price}
                      percentageChange={item.percentageChange}
                      iconColor={item.iconColor}
                      updatedAt={item.updatedAt}
                    />
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    ไม่พบข้อมูลส่วนผสม
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="impurities" className="mt-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-8">
                {isLoadingImpurities ? (
                  <div className="flex justify-center items-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : formatImpuritiesItems().length > 0 ? (
                  filterItems(formatImpuritiesItems()).map((item, index) => (
                    <MeasurementItem
                      key={index}
                      symbol={item.symbol}
                      name={item.name}
                      price={item.price}
                      percentageChange={item.percentageChange}
                      iconColor={item.iconColor}
                      updatedAt={item.updatedAt}
                    />
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    ไม่พบข้อมูลสิ่งเจือปน
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* เพิ่มพื้นที่ว่างเพื่อป้องกันเนื้อหาทับกับ footer */}
      <div className="pb-32"></div>

      {/* ใช้ FooterNav component */}
      <FooterNav />
    </div>
  );
}
