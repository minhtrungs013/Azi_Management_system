import { Dashboard } from "@/types/project";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const data = {
    labels: ["To Do", "In Progress", "Review", "Done"],
    datasets: [
        {
            data: [500, 350, 250, 150],
            backgroundColor: ["gray", "orange", "blue", "green"],
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverOffset: 10,
        },
    ],
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "right" as const,
            labels: {
                color: "#374151",
                font: {
                    size: 10,
                },
            },
        },
        tooltip: {
            enabled: true, // Tắt tooltip khi hover
        },
        datalabels: {
            color: "#ffffff", // Màu chữ trên biểu đồ
            font: {
                size: 14,
                weight: "bold" as const,
            },
            formatter: (value: number, context: any) => {
                const dataset = context.chart.data.datasets[0].data;
                const total = dataset.reduce((acc: number, curr: number) => acc + curr, 0);
                const percentage = ((value / total) * 100).toFixed(1); // Tính phần trăm
                return `${percentage}%`; // Hiển thị phần trăm
            },
        },
    },
};
export default function PieChartComponent({ data1 }: { data1: Dashboard | undefined }) {
    // Dữ liệu gốc từ Dashboard
    const rawData = [
        { label: "To Do", value: data1?.sprint.todoPercentage ?? 0, color: "gray" },
        { label: "In Progress", value: data1?.sprint.inprogressPercentage ?? 0, color: "orange" },
        { label: "Bug", value: data1?.sprint.bugPercentage ?? 0, color: "red" },    
        { label: "Review", value: data1?.sprint.reviewPercentage ?? 0, color: "blue" },
        { label: "Done", value: data1?.sprint.donePercentage ?? 0, color: "green" },    

    ];

    // Lọc bỏ những mục có giá trị = 0
    const filteredData = rawData.filter(item => item.value > 0);

    const data = {
        labels: filteredData?.map(item => item.label),
        datasets: [
            {
                data: filteredData?.map(item => item.value),
                backgroundColor: filteredData?.map(item => item.color),
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 10,
            },
        ],
    };

    return (
        <div className="flex justify-center items-center">
            <div className="w-80 h-56">
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}

