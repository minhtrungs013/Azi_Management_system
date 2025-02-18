import TaskDetail from "@/components/task/taskDetail";

export default function TaskId({ params }: { params: { projjectId: string, taskId: string } }) {
    return (
        <div >
            <div className=" ">
             <TaskDetail taskId={params.taskId}  projjectId={params.projjectId}/>
            </div>
        </div>
    );
}
