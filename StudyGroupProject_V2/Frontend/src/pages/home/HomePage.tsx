import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingsAPI, type MeetingResponse } from '../../api/meetings.api';
import { Video, Clock, Users, Calendar, Radio, ArrowRight } from 'lucide-react';

export default function HomePage() {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await meetingsAPI.getMyMeetings({
                    pageNumber: 1,
                    pageSize: 50,
                    sortBy: 'startedAt',
                    sortOrder: 'asc'
                });
                setMeetings(Array.isArray(res.data.meetings) ? res.data.meetings : []);
            } catch (error) {
                console.error('Failed to fetch meetings', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    const now = new Date();

    const liveMeetings = meetings.filter(m => m.meetingStatus === 'LIVE');
    const upcomingMeetings = meetings.filter(m => m.meetingStatus === 'SCHEDULED');


    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getTimeUntil = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - now.getTime();
        if (diff < 0) return '';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `in ${days} days`;
        }
        if (hours > 0) return `in ${hours}h ${minutes}m`;
        return `in ${minutes} minutes`;
    };

    const statusConfig = {
        LIVE: { label: 'Live Now', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500', glow: 'shadow-red-100' },
        SCHEDULED: { label: 'Upcoming', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500', glow: 'shadow-blue-100' },
        ENDED: { label: 'Ended', bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-400', glow: '' },
    };

    const MeetingCard = ({ meeting, featured = false }: { meeting: MeetingResponse; featured?: boolean }) => {
        const config = statusConfig[meeting.meetingStatus] || statusConfig.SCHEDULED;
        return (
            <div
                className={`group bg-white rounded-2xl border transition-all duration-300 cursor-pointer hover:-translate-y-1 ${featured
                    ? `p-6 shadow-lg hover:shadow-xl ${config.glow} border-${meeting.meetingStatus === 'LIVE' ? 'red' : 'blue'}-100`
                    : 'p-5 shadow-sm hover:shadow-md border-gray-100'
                    }`}
                onClick={() => {
                    if (meeting.meetingStatus === 'LIVE') {
                        navigate(`/meeting-room?roomID=${meeting.meetingRoomId}&userID=${meeting.creatorInfo?.userId || ''}`);
                    }
                }}
            >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                        {meeting.meetingStatus === 'LIVE' && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                        {meeting.meetingStatus !== 'LIVE' && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>}
                        <span>{config.label}</span>
                    </div>
                    {meeting.meetingStatus === 'SCHEDULED' && new Date(meeting.startedAt) > now && (
                        <span className="text-xs text-gray-400 font-medium">{getTimeUntil(meeting.startedAt)}</span>
                    )}
                </div>

                {/* Title */}
                <h3 className={`font-bold mb-2 truncate ${featured ? 'text-xl text-gray-900' : 'text-lg text-gray-800'}`}>
                    {meeting.title}
                </h3>

                {/* Description */}
                {meeting.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{meeting.description}</p>
                )}

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2 text-teal-500" />
                        <span className="truncate">{meeting.groupName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2 text-teal-500" />
                        <span>{formatDate(meeting.startedAt)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2 text-teal-500" />
                        <span>{formatTime(meeting.startedAt)} - {formatTime(meeting.endedAt)}</span>
                    </div>
                </div>

                {/* Creator */}
                {meeting.creatorInfo && (
                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {meeting.creatorInfo.avatarUrl ? (
                                <img src={meeting.creatorInfo.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                                    {meeting.creatorInfo.firstName?.charAt(0)}
                                </div>
                            )}
                            <span className="text-xs text-gray-500">
                                {meeting.creatorInfo.lastName} {meeting.creatorInfo.firstName}
                            </span>
                        </div>
                        {meeting.meetingStatus === 'LIVE' && (
                            <span className="text-xs font-semibold text-red-500 flex items-center gap-1 group-hover:underline">
                                Join <ArrowRight className="w-3 h-3" />
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                    <span className="text-gray-500 text-sm">Loading meetings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-6xl mx-0 space-y-10 py-4">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Meetings</h1>
                    <p className="text-gray-500">Overview of all meetings in your groups</p>
                </div>

                {/* Live Meetings */}
                {liveMeetings.length > 0 && (
                    <section>
                        <div className="flex items-center space-x-3 mb-5">
                            <div className="p-2 bg-red-100 rounded-xl text-red-600">
                                <Radio className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Live Now</h2>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{liveMeetings.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {liveMeetings.map(m => (
                                <MeetingCard key={m.meetingId} meeting={m} featured />
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Meetings */}
                <section>
                    <div className="flex items-center space-x-3 mb-5">
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            <Video className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Upcoming</h2>
                        {upcomingMeetings.length > 0 && (
                            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{upcomingMeetings.length}</span>
                        )}
                    </div>
                    {upcomingMeetings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {upcomingMeetings.map(m => (
                                <MeetingCard key={m.meetingId} meeting={m} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200">
                            <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No upcoming meetings</p>
                            <p className="text-sm text-gray-400 mt-1">Start a new meeting in your groups</p>
                        </div>
                    )}
                </section>



            </div>
        </div>
    );
}
