import { useParams } from 'react-router-dom'
import StudentProfile from './StudentProfile'

const StudentSingle = () => {
    const { id } = useParams()

    return (
        // ADDED: h-full overflow-hidden flex flex-col to perfectly constrain the layout
        <div className='h-full w-full overflow-hidden flex flex-col bg-mainBg p-2 md:p-4'>
            <StudentProfile studentId={id} />
        </div>
    )
}

export default StudentSingle