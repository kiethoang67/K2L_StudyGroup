import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI, type GroupDetailResponse, type GroupMemberResponse } from '../../api/groups.api';
import { sectionsAPI, type ListSectionsResponse } from '../../api/sections.api';
import { meetingsAPI, type MeetingResponse } from '../../api/meetings.api';
import { toast } from 'react-toastify';
import ChatBox from '../chat/ChatBox';
import { useAuthStore } from '../../store/authStore';
import AddMemberModal from './AddMemberModal';
import InviteUserModal from './InviteUserModal';
import CreateSectionModal from './CreateSectionModal';
import CreateMeetingModal from './CreateMeetingModal';
import SectionComments from './SectionComments';
import DeleteGroupModal from './DeleteGroupModal';
import AssignAdminModal from './AssignAdminModal';
import EditSectionModal from './EditSectionModal';
import { UserPlus, Trash2, Camera, Loader2, Plus, FileText, Paperclip, Search, ChevronLeft, ChevronRight, ArrowUpDown, Video, CalendarDays, Clock, RadioTower, AlertCircle, ShieldPlus, Pencil } from 'lucide-react';

interface GroupViewProps {
    groupId: string;
}

export default function GroupView({ groupId }: GroupViewProps) {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [group, setGroup] = useState<GroupDetailResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'members' | 'about' | 'chat' | 'sections' | 'meetings'>('chat');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isInviteUserOpen, setIsInviteUserOpen] = useState(false);
    const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
    const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
    const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
    const [isAssignAdminOpen, setIsAssignAdminOpen] = useState(false);
    const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<{ id: string, name: string } | null>(null);
    const [selectedSection, setSelectedSection] = useState<ListSectionsResponse | null>(null);
    // Meetings state
    const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
    const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
    const [sections, setSections] = useState<ListSectionsResponse[]>([]);
    const [sectionsTotal, setSectionsTotal] = useState(0);
    const [sectionKeyword, setSectionKeyword] = useState('');
    const [sectionPage, setSectionPage] = useState(1);
    const [sectionPageSize] = useState(10);
    const [sectionSortOrder, setSectionSortOrder] = useState<'desc' | 'asc'>('desc');
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchGroupData = useCallback(async () => {
        console.log('[GroupView] Fetching data for groupId:', groupId);
        setIsLoading(true);
        setError(null);
        try {
            const [detailRes, membersRes] = await Promise.all([
                groupsAPI.getGroupDetails(groupId),
                groupsAPI.getGroupMembers(groupId, { pageSize: 100 })
            ]);
            console.log('[GroupView] Successfully loaded group data:', detailRes.data);
            setGroup(detailRes.data);
            setMembers(membersRes.data.members);
        } catch (error) {
            console.error('[GroupView] Failed to load group data', error);
            setError('Failed to load group details. Please try again.');
            toast.error('Failed to load group details');
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    const fetchSections = useCallback(async (keyword?: string, page?: number, sortOrder?: string) => {
        setIsLoadingSections(true);
        try {
            const res = await sectionsAPI.getListSections(groupId, {
                keyword: keyword ?? (sectionKeyword || undefined),
                pageNumber: page ?? sectionPage,
                pageSize: sectionPageSize,
                sortBy: 'createdAt',
                sortOrder: sortOrder ?? sectionSortOrder,
            });
            setSections(res.data.sections || []);
            setSectionsTotal(res.data.total || 0);
        } catch (error) {
            console.error('[GroupView] Failed to load sections', error);
        } finally {
            setIsLoadingSections(false);
        }
    }, [groupId, sectionKeyword, sectionPage, sectionPageSize, sectionSortOrder]);

    const fetchMeetings = useCallback(async () => {
        setIsLoadingMeetings(true);
        try {
            const res = await meetingsAPI.getGroupMeetings(groupId, { pageNumber: 1, pageSize: 20, sortBy: 'startedAt', sortOrder: 'asc' });
            setMeetings(res.data?.meetings ?? []);
        } catch {
            console.error('[GroupView] Failed to load meetings');
        } finally {
            setIsLoadingMeetings(false);
        }
    }, [groupId]);

    useEffect(() => {
        console.log('[GroupView] useEffect triggered with groupId:', groupId);
        if (groupId) {
            fetchGroupData();
            fetchSections();
            fetchMeetings();
        }
    }, [groupId, fetchGroupData, fetchSections, fetchMeetings]);

    // Re-fetch sections when page or sort changes
    useEffect(() => {
        if (groupId && activeTab === 'sections') {
            fetchSections();
        }
    }, [sectionPage, sectionSortOrder]);

    const handleSectionSearch = (value: string) => {
        setSectionKeyword(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            setSectionPage(1);
            fetchSections(value, 1);
        }, 400);
    };

    const totalSectionPages = Math.max(1, Math.ceil(sectionsTotal / sectionPageSize));

    const handleLeaveGroup = async () => {
        if (!confirm('Are you sure you want to leave this group?')) return;
        try {
            await groupsAPI.leaveGroup(groupId);
            toast.success('Left group successfully');
            window.location.reload();
        } catch (error) {
            toast.error('Failed to leave group');
        }
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBannerPreview(URL.createObjectURL(file));
        setIsUploadingBanner(true);
        try {
            // 1. Get presigned URL
            const res = await groupsAPI.generatePresignUrlGroupBanner(groupId, { fileName: file.name, contentType: file.type });
            const { urlUpload, publicUrl } = res.data;

            // 2. PUT file directly to R2
            const uploadRes = await fetch(urlUpload, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
                credentials: 'omit',
            });

            if (!uploadRes.ok) {
                throw new Error(`Upload failed with status: ${uploadRes.status}`);
            }

            // 3. Save public URL to backend
            await groupsAPI.updateGroupBanner(groupId, publicUrl);

            // 4. Update local state
            setGroup(prev => prev ? { ...prev, bannerUrl: publicUrl } : prev);
            toast.success('Banner updated!');
        } catch (error) {
            console.error(error);
            toast.error('Banner upload failed, please try again.');
            setBannerPreview(null);
        } finally {
            setIsUploadingBanner(false);
            if (bannerInputRef.current) bannerInputRef.current.value = '';
        }
    };

    const safeMembers = Array.isArray(members) ? members : [];
    const admins = safeMembers.filter(m => m.groupRole === 'ADMIN');
    const regularMembers = safeMembers.filter(m => m.groupRole === 'MEMBER');

    console.log('[GroupView Render] Members:', safeMembers.length, 'User:', user?.id, 'Tab:', activeTab);

    const isCurrentUserAdmin = user?.id ? (admins.some(a => a.userId === user.id) || user.isAdmin) : false;
    const isMember = user?.id ? safeMembers.some(m => m.userId === user.id) : false;

    useEffect(() => {
        if (!isLoading && !isMember && activeTab === 'chat' && safeMembers.length > 0) {
            console.log('[GroupView] Redirecting to about tab');
            setActiveTab('about');
        }
    }, [isLoading, isMember, activeTab, safeMembers.length]);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading group...</div>;
    if (error) return (
        <div className="p-8 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
                onClick={fetchGroupData}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
                Retry
            </button>
        </div>
    );
    if (!group) return <div className="p-8 text-center text-gray-500">Select a group to view details</div>;

    const handleJoinGroup = async () => {
        try {
            await groupsAPI.joinGroup(groupId);
            toast.success('Joined group successfully');
            fetchGroupData();
        } catch (error) {
            toast.error('Failed to join group');
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from the group?`)) return;
        try {
            await groupsAPI.removeMember(groupId, memberId);
            toast.success('Removed member successfully');
            fetchGroupData();
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Banner */}
            <div className="relative w-full h-40 bg-gradient-to-r from-teal-400 to-cyan-500 flex-shrink-0 overflow-hidden group">
                {(bannerPreview || group.bannerUrl) ? (
                    <img
                        src={bannerPreview || group.bannerUrl}
                        alt="Group Banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-teal-400 to-cyan-500" />
                )}

                {/* Upload overlay — admin only */}
                {isCurrentUserAdmin && (
                    <div
                        className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => bannerInputRef.current?.click()}
                    >
                        {isUploadingBanner ? (
                            <div className="flex flex-col items-center gap-2 text-white">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-sm font-medium">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-white">
                                <Camera className="w-8 h-8" />
                                <span className="text-sm font-medium">Change banner</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerChange}
                />
            </div>

            {/* Tabs */}
            <div className="flex items-center px-8 border-b border-gray-100 bg-white sticky top-0 z-10 space-x-8">
                {isMember && (
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'chat'
                            ? 'border-teal-400 text-teal-500'
                            : 'border-transparent text-gray-800 hover:text-gray-600'
                            }`}
                    >
                        Chat
                    </button>
                )}

                <button
                    onClick={() => setActiveTab('members')}
                    className={`py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'members'
                        ? 'border-teal-400 text-teal-500'
                        : 'border-transparent text-gray-800 hover:text-gray-600'
                        }`}
                >
                    Member
                </button>

                {isMember && (
                    <button
                        onClick={() => setActiveTab('meetings')}
                        className={`py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'meetings'
                            ? 'border-teal-400 text-teal-500'
                            : 'border-transparent text-gray-800 hover:text-gray-600'
                            }`}
                    >
                        Meetings
                    </button>
                )}

                {isMember && (
                    <button
                        onClick={() => setActiveTab('sections')}
                        className={`py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'sections'
                            ? 'border-teal-400 text-teal-500'
                            : 'border-transparent text-gray-800 hover:text-gray-600'
                            }`}
                    >
                        Sections
                    </button>
                )}

                <button
                    onClick={() => setActiveTab('about')}
                    className={`py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'about'
                        ? 'border-teal-400 text-teal-500'
                        : 'border-transparent text-gray-800 hover:text-gray-600'
                        }`}
                >
                    About
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-gray-50">
                {activeTab === 'chat' && isMember && (
                    <div className="max-w-4xl mx-auto h-full flex flex-col p-6">
                        <ChatBox groupId={groupId} members={members} />
                    </div>
                )}
                {activeTab === 'members' && (
                    <div className="overflow-y-auto h-full">
                        <div className="max-w-4xl mx-auto pt-8 px-6 pb-8">
                            {/* Admins */}
                            <div className="mb-12">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Admin</h3>
                                    {isMember && (
                                        <div className="flex items-center gap-2">
                                            {isCurrentUserAdmin ? (
                                                <button
                                                    onClick={() => setIsAddMemberOpen(true)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-medium text-sm border border-teal-200"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    <span>Add Member</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsInviteUserOpen(true)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors font-medium text-sm border border-cyan-200"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    <span>Invite</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="border-b border-gray-200" />
                                <div className="divide-y divide-gray-100">
                                    {admins.map(member => (
                                        <div key={member.userId} className="py-4 flex items-center space-x-4">
                                            <img
                                                src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`}
                                                alt={member.firstName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-700">{member.firstName} {member.lastName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Members */}
                            {regularMembers.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Member</h3>
                                        <span className="text-gray-500 text-sm">{regularMembers.length} members</span>
                                    </div>
                                    <div className="border-b border-gray-200" />
                                    <div className="divide-y divide-gray-100">
                                        {regularMembers.map(member => (
                                            <div key={member.userId} className="py-4 flex items-center justify-between group">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`}
                                                        alt={member.firstName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-700">{member.firstName} {member.lastName}</p>
                                                    </div>
                                                </div>
                                                {isCurrentUserAdmin && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMember({ id: member.userId, name: `${member.firstName} ${member.lastName}` });
                                                                setIsAssignAdminOpen(true);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Assign as Admin"
                                                        >
                                                            <ShieldPlus className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveMember(member.userId, member.firstName)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Remove member"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <AddMemberModal
                                isOpen={isAddMemberOpen}
                                onClose={() => setIsAddMemberOpen(false)}
                                groupId={groupId}
                                onSuccess={fetchGroupData}
                            />
                            <InviteUserModal
                                isOpen={isInviteUserOpen}
                                onClose={() => setIsInviteUserOpen(false)}
                                groupId={groupId}
                            />
                            {selectedMember && (
                                <AssignAdminModal
                                    isOpen={isAssignAdminOpen}
                                    onClose={() => {
                                        setIsAssignAdminOpen(false);
                                        setSelectedMember(null);
                                    }}
                                    groupId={groupId}
                                    userId={selectedMember.id}
                                    userName={selectedMember.name}
                                    onSuccess={fetchGroupData}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'meetings' && isMember && (
                    <div className="overflow-y-auto h-full">
                        <div className="max-w-4xl mx-auto pt-8 px-6 pb-8">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Meetings</h3>
                                <button
                                    onClick={() => setIsCreateMeetingOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Meeting
                                </button>
                            </div>

                            {isLoadingMeetings ? (
                                <div className="text-center py-16">
                                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-teal-500" />
                                </div>
                            ) : meetings.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <CalendarDays className="w-14 h-14 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 font-medium">No meetings yet.</p>
                                    <p className="text-gray-400 text-sm mt-1">Create your first meeting!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {meetings.map(meeting => {
                                        const isLive = meeting.meetingStatus === 'LIVE';
                                        const startTime = new Date(meeting.startedAt).getTime();
                                        const now = Date.now();
                                        const hasStarted = now >= startTime;
                                        const canJoin = isLive || (meeting.meetingStatus === 'SCHEDULED' && hasStarted);

                                        return (
                                            <div
                                                key={meeting.meetingId}
                                                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {isLive ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                                                                    <RadioTower className="w-3 h-3" /> LIVE
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                                                                    <Clock className="w-3 h-3" /> {hasStarted ? 'Started' : 'Scheduled'}
                                                                </span>
                                                            )}
                                                            <h4 className="font-semibold text-gray-800 truncate">{meeting.title}</h4>
                                                        </div>
                                                        {meeting.description && (
                                                            <p className="text-sm text-gray-500 mb-2 truncate">{meeting.description}</p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(meeting.startedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                                                {' → '}
                                                                {new Date(meeting.endedAt).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                                                            </span>
                                                            <span>Organized by: {meeting.creatorInfo?.firstName} {meeting.creatorInfo?.lastName}</span>
                                                        </div>
                                                    </div>

                                                    {/* Join button */}
                                                    <button
                                                        onClick={() => canJoin && navigate(`/meeting-room?roomId=${meeting.meetingRoomId}&groupId=${groupId}`)}
                                                        disabled={!canJoin}
                                                        title={!canJoin ? 'Meeting has not started yet' : ''}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm flex-shrink-0 transition-colors ${!canJoin
                                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            : isLive
                                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                                : 'bg-teal-500 text-white hover:bg-teal-600'
                                                            }`}
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        {isLive ? 'Join Now' : hasStarted ? 'Enter Room' : 'Not Started'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <CreateMeetingModal
                                isOpen={isCreateMeetingOpen}
                                onClose={() => setIsCreateMeetingOpen(false)}
                                groupId={groupId}
                                onSuccess={fetchMeetings}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'sections' && isMember && (
                    <div className="overflow-y-auto h-full">
                        <div className="max-w-4xl mx-auto pt-8 px-6 pb-8">
                            {/* Header with Create button */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Sections</h3>
                                <button
                                    onClick={() => setIsCreateSectionOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Section
                                </button>
                            </div>

                            {/* Search & Sort bar */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={sectionKeyword}
                                        onChange={(e) => handleSectionSearch(e.target.value)}
                                        placeholder="Search sections..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all text-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const next = sectionSortOrder === 'desc' ? 'asc' : 'desc';
                                        setSectionSortOrder(next);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
                                    title={`Sort: ${sectionSortOrder === 'desc' ? 'Newest' : 'Oldest'}`}
                                >
                                    <ArrowUpDown className="w-4 h-4" />
                                    {sectionSortOrder === 'desc' ? 'Newest' : 'Oldest'}
                                </button>
                            </div>

                            {/* Loading state */}
                            {isLoadingSections ? (
                                <div className="text-center py-16">
                                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-teal-500" />
                                </div>
                            ) : sections.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{sectionKeyword ? 'No sections found.' : 'No sections yet. Create the first one!'}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sections.map(section => (
                                        <div key={section.sectionId} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                            {/* Creator info */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <img
                                                    src={section.creatorInfo?.avatarUrl || `https://ui-avatars.com/api/?name=${section.creatorInfo?.firstName}+${section.creatorInfo?.lastName}&background=random`}
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {section.creatorInfo?.firstName} {section.creatorInfo?.lastName}
                                                </span>
                                                {(section.creatorInfo?.id === user?.id || isCurrentUserAdmin) && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSection(section);
                                                            setIsEditSectionOpen(true);
                                                        }}
                                                        className="ml-auto p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                        title="Edit section"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <p className="text-gray-800 whitespace-pre-wrap mb-3">{section.content}</p>

                                            {/* Attachments */}
                                            {section.attachments && section.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {section.attachments.map((url, i) => (
                                                        <a
                                                            key={i}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-teal-600 hover:bg-gray-200 transition-colors"
                                                        >
                                                            <Paperclip className="w-3.5 h-3.5" />
                                                            {url.split('/').pop() || `File ${i + 1}`}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Comments */}
                                            <SectionComments
                                                sectionId={section.sectionId}
                                                initialTotal={section.totalComments}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {sectionsTotal > sectionPageSize && (
                                <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setSectionPage(p => Math.max(1, p - 1))}
                                        disabled={sectionPage === 1}
                                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page <span className="font-semibold text-gray-800">{sectionPage}</span> / {totalSectionPages}
                                    </span>
                                    <button
                                        onClick={() => setSectionPage(p => Math.min(totalSectionPages, p + 1))}
                                        disabled={sectionPage >= totalSectionPages}
                                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <CreateSectionModal
                                isOpen={isCreateSectionOpen}
                                onClose={() => setIsCreateSectionOpen(false)}
                                groupId={groupId}
                                onSuccess={() => { setSectionPage(1); fetchSections(undefined, 1); }}
                            />
                            <EditSectionModal
                                isOpen={isEditSectionOpen}
                                onClose={() => { setIsEditSectionOpen(false); setSelectedSection(null); }}
                                section={selectedSection}
                                onSuccess={() => fetchSections()}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="overflow-y-auto h-full">
                        <div className="max-w-4xl mx-auto pt-16 px-6 relative"> {/* Added top padding */}
                            <div className="space-y-6">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-2xl font-bold text-gray-900">Name :</span>
                                    <span className="text-2xl text-gray-800">{group.name}</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-lg font-bold text-gray-900 block">Description:</span>
                                    <p className="text-gray-800 leading-relaxed text-lg">
                                        {group.description}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <span className="text-lg font-bold text-gray-900">Hashtag:</span>
                                    <div className="flex flex-wrap gap-1 text-lg text-gray-800">
                                        {group.tags?.map((tag, index) => (
                                            <span key={tag}>
                                                #{tag}{index < (group.tags?.length || 0) - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-32 flex justify-end"> {/* Pushed to bottom */}
                                {isMember ? (
                                    <button
                                        onClick={handleLeaveGroup}
                                        className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-colors text-lg shadow-sm"
                                    >
                                        Leave group
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleJoinGroup}
                                        className="px-8 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 font-medium transition-colors text-lg shadow-sm"
                                    >
                                        Join group
                                    </button>
                                )}
                            </div>

                            {isCurrentUserAdmin && (
                                <div className="mt-8 pt-8 border-t border-red-100 flex flex-col items-center">
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 max-w-lg mb-4">
                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-red-600 text-sm italic">Danger Zone</p>
                                            <p className="text-xs text-red-600/70 mt-0.5">
                                                Deleting the group will remove all members and permanently delete all data. This action CANNOT be undone.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsDeleteGroupOpen(true)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 font-bold transition-all hover:shadow-md hover:shadow-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Study Group
                                    </button>
                                </div>
                            )}

                            <DeleteGroupModal
                                isOpen={isDeleteGroupOpen}
                                onClose={() => setIsDeleteGroupOpen(false)}
                                groupId={groupId}
                                groupName={group.name}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
