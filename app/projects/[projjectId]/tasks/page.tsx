import GetTasksByProjectId from "@/components/task/getTasksByProjectId";

export default function Tasks({ params }: { params: { projjectId: string } }) {

    return (
        <div >
            <div className="flex ">
                <main className="flex-1 py-3 ">
                  <GetTasksByProjectId projjectId={params.projjectId} />
                </main>
            </div>
        </div>
    );
}
