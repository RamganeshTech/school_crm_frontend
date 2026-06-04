import { useAuthData } from '../../hooks/useAuthData';
import SubscriptionModule from './SubscriptionModule';

const SubscriptionMain = () => {
    const { schoolId, isPlatformAdmin } = useAuthData();

    return (
        <SubscriptionModule  schoolId={schoolId!} isPlatformAdmin={isPlatformAdmin} />
    )
}

export default SubscriptionMain