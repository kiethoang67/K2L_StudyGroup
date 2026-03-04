import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import GroupView from '../../components/groups/GroupView';

export default function GroupFocusPage() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    if (!groupId) {
        return <div>Group ID is missing</div>;
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Simple Header with Back Button */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center shadow-sm sticky top-0 z-20">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 hover:text-teal-600 transition-colors font-medium"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Dashboard
                </button>
            </div>

            {/* Main Content - Reusing GroupView */}
            <div className="flex-1 overflow-hidden">
                <GroupView groupId={groupId} />
            </div>
        </div>
    );
}
