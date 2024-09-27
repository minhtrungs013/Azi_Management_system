import TableListProjects from '@/components/project/tableListProjects';
import Toolbar from '@/components/project/toolbar';

export default function Projects() {

    return (
        <div className="pt-10 pr-5">
            <Toolbar />
            <TableListProjects />
        </div>
    );
}
