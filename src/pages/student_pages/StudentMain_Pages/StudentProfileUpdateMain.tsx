import { StudentProfilePendingUpdate } from './StudentProfilePendingUpdate'
import { useParams } from 'react-router-dom'

const StudentProfileUpdateMain = () => {
    const { id } = useParams()

    return (
        <div className='h-full w-full flex flex-col bg-mainBg p-2 md:p-4 overflow-y-auto'>
            <StudentProfilePendingUpdate studentId={id!} />
        </div>
    )
}

export default StudentProfileUpdateMain