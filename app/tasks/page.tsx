import ProjectHeader from '@/components/project/projectHeader/projectHeader'
import ProjectTodo from '@/components/project/projectTodo/projectTodo'

export default function Tasks() {

    return (
        <div >
            <div className="flex ">
                <main className="flex-1 p-6 ">
                    <ProjectHeader/>
                    <ProjectTodo/>
                </main>
            </div>
        </div>
    )
}
