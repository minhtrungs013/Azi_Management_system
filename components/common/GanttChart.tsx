import Chart from "react-apexcharts";
import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const taskData = {
  week: [
    { name: "Task A", start: new Date("2025-02-19"), end: new Date("2025-02-23") },
    { name: "Task B", start: new Date("2025-02-20"), end: new Date("2025-02-25") },
    { name: "Task C", start: new Date("2025-02-21"), end: new Date("2025-02-26") },
    { name: "Task A2", start: new Date("2025-02-19"), end: new Date("2025-02-23") },
    { name: "Task B3", start: new Date("2025-02-20"), end: new Date("2025-02-25") },
    { name: "Task C4", start: new Date("2025-02-21"), end: new Date("2025-02-26") },
  ],
  month: [
    { name: "Task X", start: new Date("2025-02-01"), end: new Date("2025-02-15") },
    { name: "Task Y", start: new Date("2025-02-05"), end: new Date("2025-02-20") },
    { name: "Task Z", start: new Date("2025-02-10"), end: new Date("2025-02-28") },
  ],
};

export default function GanttChart() {
  const [selectedRange, setSelectedRange] = useState<"week" | "month">("week");
  const tasks = taskData[selectedRange];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: "rangeBar", toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: true },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: { colors: "#6B7280", fontSize: "14px" },
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM yyyy",
          day: "dd MMM",
          hour: "HH:mm",
        },
      },
    },
    yaxis: {
      labels: { style: { colors: "#6B7280", fontSize: "14px" } },
    },
  };

  const chartSeries = [
    {
      data: tasks.map((task) => ({
        x: task.name,
        y: [task.start.getTime(), task.end.getTime()], // Dùng nguyên getTime() (milliseconds)
      })),
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between w-full items-center mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-7 h-7 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800">Gantt Chart</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {selectedRange === "week" ? "Week" : "Month"} <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedRange("week")}>Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedRange("month")}>Month</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="w-full h-96 bg-gray-50 p-4 rounded-lg shadow-inner">
        <Chart options={chartOptions} series={chartSeries} type="rangeBar" height={350} />
      </div>
    </div>
  );
}
