import GetTasksByProjectId from "@/components/task/getTasksByProjectId";

export default function Tasks() {

    return (
        <div >
            <div className="flex ">
                <main className="flex-1 py-3 ">
                  <GetTasksByProjectId />
                </main>
            </div>
        </div>
    );
}
