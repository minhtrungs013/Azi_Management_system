import { useState } from "react";
import Chart from "react-apexcharts";
import { LineChart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const dataSets = {
  week: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    idealData: [50, 45, 40, 35, 30, 25, 20],
    actualData: [50, 48, 42, 38, 35, 30, 25],
  },
  sprint: {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
    idealData: [50, 45, 40, 35, 30, 25, 20, 15, 10, 0],
    actualData: [50, 48, 42, 38, 35, 30, 25, 18, 10, 5],
  },
  project: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
    idealData: [400, 350, 300, 250, 200, 150, 100, 0],
    actualData: [400, 360, 320, 280, 230, 180, 120, 50],
  },
};

export default function BurnDownChart() {
  const [selectedOption, setSelectedOption] = useState("sprint");
  const { labels, idealData, actualData } = dataSets[selectedOption as keyof typeof dataSets];

  const chartOptions = {
    chart: {
      type: "line" as "line",
      height: 350,
      toolbar: { show: false },
    },
    stroke: { curve: "smooth" as "smooth", width: 2 },
    xaxis: { categories: labels },
    yaxis: { labels: { formatter: (value: number) => value.toFixed(0) } },
    colors: ["#10B981", "#EF4444"],
  };

  const series = [
    { name: "Ideal Burn-down", data: idealData },
    { name: "Actual Burn-down", data: actualData },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between w-full items-center mb-4">
        <div className="flex items-center gap-2">
          <LineChart className="w-7 h-7 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800">Burn-down Chart</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {selectedOption === "sprint" ? "Sprint" : selectedOption === "week" ? "Week" : "Project"} <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedOption("sprint")}>Sprint</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedOption("week")}>Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedOption("project")}>Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full h-96 bg-gray-50 p-4 rounded-lg shadow-inner">
        <Chart options={chartOptions} series={series} type="line" height={350} />
      </div>
    </div>
  );
}
