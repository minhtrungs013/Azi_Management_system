import BackLog from "@/components/project/backLog/backLog";

export default function Tasks({ params }: { params: { projjectId: string } }) {

    return (
        <div >
            <div className="flex ">
                <main className="flex-1 py-3 ">
                  <BackLog projjectId={params.projjectId} />
                </main>
            </div>
        </div>
    );
}
