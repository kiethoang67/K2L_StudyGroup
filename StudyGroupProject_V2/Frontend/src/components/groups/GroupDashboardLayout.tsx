import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { groupsAPI, type GroupListResponse } from '../../api/groups.api';
import CreateGroupModal from './CreateGroupModal';

interface GroupDashboardLayoutProps {
    children: React.ReactNode;
    selectedGroupId?: string;
    onSelectGroup: (groupId: string) => void;
}

export default function GroupDashboardLayout({ children, selectedGroupId, onSelectGroup }: GroupDashboardLayoutProps) {
    const [groups, setGroups] = useState<GroupListResponse[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchGroups = async () => {
        try {
            const response = await groupsAPI.getMyGroups();
            console.log('Fetched groups:', response.data); 
            setGroups(response.data.groups);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
                <div className="p-4 flex justify-between items-center group">
                    <div className="flex items-center space-x-2 pl-2 border-l-4 border-orange-400">
                        <h2 className="font-semibold text-gray-800">My Group</h2>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-800"
                        title="Create New Group"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mt-2">
                    {groups.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm px-4">
                            No groups yet.<br />Click + to create one.
                        </div>
                    )}
                    {groups.map((group) => (
                        <button
                            key={group.groupId}
                            onClick={() => onSelectGroup(group.groupId)}
                            className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-colors ${selectedGroupId === group.groupId
                                ? 'bg-teal-50/50'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-3 h-3 rounded-sm ${selectedGroupId === group.groupId ? 'bg-pink-500' : 'bg-gray-300'}`} />
                            <span className={`truncate font-medium ${selectedGroupId === group.groupId ? 'text-gray-900' : 'text-gray-500'}`}>
                                {group.groupName}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-gray-50">
                {children}
            </div>

            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchGroups}
            />
        </div>
    );
}
