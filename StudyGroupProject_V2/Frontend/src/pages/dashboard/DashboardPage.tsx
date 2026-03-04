import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { groupsAPI, type GroupListResponse } from '../../api/groups.api';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import { Users, Plus, Search, Tag, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
    const { fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const [joinedGroups, setJoinedGroups] = useState<GroupListResponse[]>([]);
    const [publicGroups, setPublicGroups] = useState<GroupListResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Joined Groups Pagination
    const [joinedPage, setJoinedPage] = useState(1);
    const [joinedTotal, setJoinedTotal] = useState(0);
    const joinedPageSize = 6;

    // Recommended Groups Pagination
    const [publicPage, setPublicPage] = useState(1);
    const [publicTotal, setPublicTotal] = useState(0);
    const publicPageSize = 6;

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const fetchGroups = async () => {
        try {
            const [joinedRes, publicRes] = await Promise.all([
                groupsAPI.getMyGroups({ pageNumber: joinedPage, pageSize: joinedPageSize }),
                groupsAPI.getPublicGroups({ pageNumber: publicPage, pageSize: publicPageSize })
            ]);

            setJoinedGroups(Array.isArray(joinedRes.data.groups) ? joinedRes.data.groups : []);
            setJoinedTotal(joinedRes.data.totalGroups || 0);

            setPublicGroups(Array.isArray(publicRes.data.groups) ? publicRes.data.groups : []);
            setPublicTotal(publicRes.data.totalGroups || 0);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [joinedPage, publicPage]);

    useEffect(() => {
        // Initial fetch handled by the other useEffect checking page numbers
    }, []);

    // Collect all tags from joined groups for recommendations
    const myTags = useMemo(() => {
        const tags = new Set<string>();
        joinedGroups.forEach(g => g.tags?.forEach(t => tags.add(t)));
        return tags;
    }, [joinedGroups]);

    // All unique tags from public groups (for filter)
    const allPublicTags = useMemo(() => {
        const tags = new Set<string>();
        publicGroups.forEach(g => g.tags?.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [publicGroups]);

    // Recommended groups: public groups not joined, scored by tag overlap
    const recommendedGroups = useMemo(() => {
        const joinedIds = new Set(joinedGroups.map(g => g.groupId));
        let available = publicGroups.filter(g => !joinedIds.has(g.groupId));

        // Filter by selected tag
        if (selectedTag) {
            available = available.filter(g => g.tags?.includes(selectedTag));
        }

        // Filter by search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            available = available.filter(g =>
                g.groupName.toLowerCase().includes(q) ||
                g.description?.toLowerCase().includes(q) ||
                g.tags?.some(t => t.toLowerCase().includes(q))
            );
        }

        // Sort by tag overlap count (desc)
        return available.sort((a, b) => {
            const aScore = a.tags?.filter(t => myTags.has(t)).length || 0;
            const bScore = b.tags?.filter(t => myTags.has(t)).length || 0;
            return bScore - aScore;
        });
    }, [publicGroups, joinedGroups, myTags, selectedTag, searchQuery]);

    const handleGroupClick = (groupId: string) => {
        navigate(`/groups/${groupId}`);
    };

    const tagColors = [
        'bg-teal-50 text-teal-700 border-teal-200',
        'bg-blue-50 text-blue-700 border-blue-200',
        'bg-purple-50 text-purple-700 border-purple-200',
        'bg-amber-50 text-amber-700 border-amber-200',
        'bg-rose-50 text-rose-700 border-rose-200',
        'bg-emerald-50 text-emerald-700 border-emerald-200',
        'bg-indigo-50 text-indigo-700 border-indigo-200',
        'bg-cyan-50 text-cyan-700 border-cyan-200',
    ];

    const getTagColor = (tag: string) => {
        let hash = 0;
        for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        return tagColors[Math.abs(hash) % tagColors.length];
    };

    const GroupCard = ({ group, isJoined }: { group: GroupListResponse; isJoined: boolean }) => {
        const matchingTags = group.tags?.filter(t => myTags.has(t)) || [];
        return (
            <div
                onClick={() => handleGroupClick(group.groupId)}
                className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1 flex flex-col h-full"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-sm ${isJoined
                        ? 'bg-gradient-to-br from-teal-400 to-emerald-500'
                        : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                        }`}>
                        {group.groupName.charAt(0).toUpperCase()}
                    </div>
                    {isJoined && group.groupRole && (
                        <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
                            {group.groupRole}
                        </span>
                    )}
                    {!isJoined && matchingTags.length > 0 && (
                        <span className="text-xs px-2.5 py-1 bg-teal-50 text-teal-600 rounded-lg font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {matchingTags.length} tags match
                        </span>
                    )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate group-hover:text-teal-700 transition-colors">
                    {group.groupName}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                    {group.description || (isJoined ? 'Click to see group details.' : 'Join to connect with others.')}
                </p>

                {/* Tags */}
                {group.tags && group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {group.tags.slice(0, 4).map(tag => (
                            <span
                                key={tag}
                                className={`text-xs px-2 py-0.5 rounded-md border font-medium ${getTagColor(tag)} ${myTags.has(tag) ? 'ring-1 ring-teal-300' : ''
                                    }`}
                            >
                                {tag}
                            </span>
                        ))}
                        {group.tags.length > 4 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 border border-gray-200">
                                +{group.tags.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-gray-50 flex justify-end">
                    <span className={`text-sm font-semibold flex items-center gap-1 ${isJoined ? 'text-teal-600' : 'text-blue-600'
                        } group-hover:gap-2 transition-all`}>
                        {isJoined ? 'View Group' : 'View Details'}
                        <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>
        );
    };

    const Pagination = ({
        currentPage,
        totalItems,
        pageSize,
        onPageChange
    }: {
        currentPage: number;
        totalItems: number;
        pageSize: number;
        onPageChange: (page: number) => void
    }) => {
        const totalPages = Math.ceil(totalItems / pageSize);
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                </button>
                <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange(i + 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                                ? 'bg-teal-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                    <span className="text-gray-500 text-sm">Loading groups...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-6xl mx-0 space-y-10 py-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Study Groups</h1>
                        <p className="text-gray-500">Manage your groups and discover new ones</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-200 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Group</span>
                    </button>
                </div>

                {/* Joined Groups */}
                <section>
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Joined Groups</h2>
                        <span className="bg-teal-100 text-teal-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{joinedGroups.length}</span>
                    </div>

                    {joinedGroups.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {joinedGroups.map(group => (
                                    <GroupCard key={group.groupId} group={group} isJoined />
                                ))}
                            </div>
                            <Pagination
                                currentPage={joinedPage}
                                totalItems={joinedTotal}
                                pageSize={joinedPageSize}
                                onPageChange={setJoinedPage}
                            />
                        </>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">You haven't joined any groups yet</p>
                            <p className="text-sm text-gray-400 mt-1">Create a new group or join the recommended ones below</p>
                        </div>
                    )}
                </section>

                {/* Recommended Groups */}
                <section>
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Tag Filter */}
                    {allPublicTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${!selectedTag
                                    ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
                                    }`}
                            >
                                <Tag className="w-3 h-3" />
                                All
                            </button>
                            {allPublicTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${selectedTag === tag
                                        ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                                        : `${getTagColor(tag)} hover:shadow-sm`
                                        }`}
                                >
                                    {tag}
                                    {myTags.has(tag) && <span className="ml-1">✓</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {recommendedGroups.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {recommendedGroups.map(group => (
                                    <GroupCard key={group.groupId} group={group} isJoined={false} />
                                ))}
                            </div>
                            <Pagination
                                currentPage={publicPage}
                                totalItems={publicTotal}
                                pageSize={publicPageSize}
                                onPageChange={setPublicPage}
                            />
                        </>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200">
                            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No matching groups found</p>
                            <p className="text-sm text-gray-400 mt-1">Try changing your filters or search keywords</p>
                        </div>
                    )}
                </section>
            </div>

            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchGroups}
            />
        </div>
    );
}
