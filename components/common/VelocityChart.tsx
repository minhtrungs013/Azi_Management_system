import Chart from "react-apexcharts";
import { useState } from "react";
import { BarChart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const dataSets = {
  storyPoints: {
    label: "Story Points Completed",
    data: [20, 30, 25, 35, 40, 38, 25, 65, 14, 114],
  },
  taskCount: {
    label: "Tasks Completed",
    data: [5, 7, 6, 8, 10, 9, 12, 54, 62, 85],
  },
};

const sprintLabels = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5", "Sprint 6", "Sprint 7", "Sprint 8", "Sprint 9", "Sprint 10"];

export default function VelocityChart() {
  const [selectedMetric, setSelectedMetric] = useState("storyPoints");
  const { label, data } = dataSets[selectedMetric as keyof typeof dataSets];

  const chartOptions = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
    },
    xaxis: {
      categories: sprintLabels,
      labels: { style: { colors: "#6B7280", fontSize: "14px" } },
    },
    yaxis: {
      labels: { style: { colors: "#6B7280", fontSize: "14px" } },
    },
    fill: { colors: ["#3B82F6"] },
  };

  const chartSeries = [{ name: label, data }];

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-2xl">
      <div className="flex justify-between w-full items-center mb-4">
        <div className="flex items-center gap-2">
          <BarChart className="w-7 h-7 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800">Velocity Chart</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {selectedMetric === "storyPoints" ? "Story Points" : "Task Count"} <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedMetric("storyPoints")}>Story Points</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedMetric("taskCount")}>Task Count</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full h-96 bg-gray-50 p-4 rounded-lg shadow-inner">
        <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
      </div>
    </div>
  );
}
