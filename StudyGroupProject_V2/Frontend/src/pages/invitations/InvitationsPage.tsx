import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../api/auth.api';
import { groupsAPI, type InvitationResponse } from '../../api/groups.api';
import { toast } from 'react-toastify';
import { Loader2, MailOpen, Check, X, Users, Search } from 'lucide-react';

export default function InvitationsPage() {
    const [invitations, setInvitations] = useState<InvitationResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const pageSize = 10;

    const fetchInvitations = useCallback(async (kw = keyword, page = pageNumber) => {
        setIsLoading(true);
        try {
            const res = await authAPI.getInvitations({
                keyword: kw || undefined,
                pageNumber: page,
                pageSize,
            });
            setInvitations(res.data?.invitations ?? []);
            setTotal(res.data?.total ?? 0);
        } catch {
            toast.error('Could not load invitations');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleResponse = async (groupId: string, groupName: string, decision: boolean) => {
        setRespondingId(groupId);
        try {
            await groupsAPI.responseInvite(groupId, decision);
            toast.success(decision ? `Joined group "${groupName}"` : `Declined invitation from "${groupName}"`);
            // Remove from list locally for instant feedback
            setInvitations(prev => prev.filter(inv => inv.groupId !== groupId));
            setTotal(prev => Math.max(0, prev - 1));
        } catch (error: any) {
            const msg = error.response?.data?.message || 'An error occurred';
            toast.error(msg);
        } finally {
            setRespondingId(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const handleSearch = (value: string) => {
        setKeyword(value);
        setPageNumber(1);
        fetchInvitations(value, 1);
    };

    const handlePageChange = (newPage: number) => {
        setPageNumber(newPage);
        fetchInvitations(keyword, newPage);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto py-10 px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                            <MailOpen className="w-5 h-5 text-teal-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Group Invitations</h1>
                    </div>
                    <p className="text-gray-500 ml-13 pl-1 mt-1 text-sm">
                        Invitations from groups you've been invited to will appear here.
                    </p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by group name..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all text-sm shadow-sm"
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Users className="w-14 h-14 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium">
                            {keyword ? 'No matching invitations found.' : 'You have no invitations.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {invitations.map((inv) => (
                            <div
                                key={inv.groupId}
                                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Group info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{inv.groupName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Pending response</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleResponse(inv.groupId, inv.groupName, false)}
                                        disabled={respondingId === inv.groupId}
                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 font-medium text-sm transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleResponse(inv.groupId, inv.groupName, true)}
                                        disabled={respondingId === inv.groupId}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors disabled:opacity-50"
                                    >
                                        {respondingId === inv.groupId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 pt-4">
                                <button
                                    onClick={() => handlePageChange(pageNumber - 1)}
                                    disabled={pageNumber === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ← Prev
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page <span className="font-semibold text-gray-800">{pageNumber}</span> / {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pageNumber + 1)}
                                    disabled={pageNumber >= totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
