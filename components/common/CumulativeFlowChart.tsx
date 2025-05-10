import Chart from "react-apexcharts";
import { useState } from "react";
import { TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const flowData = {
  week: {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    series: [
      { name: "To Do", data: [50, 45, 40, 38, 35, 30, 25] }, // Xanh
      { name: "In Progress", data: [10, 12, 15, 18, 20, 22, 25] }, // Vàng
      { name: "Review", data: [5, 8, 10, 12, 15, 18, 20] }, // Cam
      { name: "Done", data: [2, 5, 8, 12, 18, 25, 30] }, // Tím
    ],
  },
  sprint: {
    categories: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"],
    series: [
      { name: "To Do", data: [200, 180, 160, 140, 120] },
      { name: "In Progress", data: [50, 60, 70, 75, 80] },
      { name: "Review", data: [20, 30, 35, 40, 45] },
      { name: "Done", data: [10, 30, 50, 80, 120] },
    ],
  },
};

export default function CumulativeFlowChart() {
  const [selectedRange, setSelectedRange] = useState<"week" | "sprint">("week");
  const data = flowData[selectedRange];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: "area", stacked: true, toolbar: { show: false } },
    colors: ["#3B82F6", "#FACC15", "#F97316", "green"], // Màu tương ứng với trạng thái
    xaxis: {
      categories: data.categories,
      labels: { style: { colors: "#6B7280", fontSize: "14px" } },
    },
    yaxis: {
      labels: { style: { colors: "#6B7280", fontSize: "14px" } },
    },
    legend: {
      position: "top",
      labels: { colors: "#374151" },
    },
    stroke: { width: 2, curve: "smooth" },
    fill: { type: "gradient", gradient: { shadeIntensity: 0, opacityFrom: 0, opacityTo: 0 } },
  };

  return (
    <div className="">
      <div className="flex justify-between w-full items-center mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800">Cumulative Flow Diagram</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {selectedRange === "week" ? "Week" : "Sprint"} <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedRange("week")}>Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedRange("sprint")}>Sprint</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full h-96 bg-gray-50 p-4 rounded-lg shadow-inner">
        <Chart options={chartOptions} series={data.series} type="area" height={350} />
      </div>
    </div>
  );
}
