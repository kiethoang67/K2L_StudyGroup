import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import { authAPI, type AdminStats } from '../../api/auth.api';
import type { User } from '../../types/auth.types';

type AdminTab = 'users' | 'groups';

export default function AdminDashboard() {
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<AdminTab>('users');

    // Stats State
    const [stats, setStats] = useState<AdminStats | null>(null);

    // Users & Groups State
    const [users, setUsers] = useState<User[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [groups, setGroups] = useState<any[]>([]);
    const [totalGroups, setTotalGroups] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalItems = activeTab === 'users' ? totalUsers : totalGroups;
    const totalPages = Math.ceil(totalItems / pageSize);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Always fetch stats to keep them fresh
            const statsRes = await authAPI.adminGetStats();
            setStats(statsRes.data);

            if (activeTab === 'users') {
                const res = await authAPI.adminGetAllUsers(keyword, page, 10);
                setUsers(res.data.users);
                setTotalUsers(res.data.totalUsers);
            } else {
                const res = await authAPI.adminGetAllGroups({ keyword, pageNumber: page, pageSize: 10 });
                setGroups(res.data.groups);
                setTotalGroups(res.data.totalGroups);
            }
        } catch (error) {
            console.error('Failed to fetch admin data', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, page, keyword]);

    const handleBanUser = async (userId: string) => {
        if (!confirm('Deactivate this account?')) return;
        try {
            await authAPI.adminBanUser(userId);
            toast.success('Deactivated');
            fetchData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('PERMANENTLY DELETE this user?')) return;
        try {
            await authAPI.adminDeleteUser(userId);
            toast.success('Deleted');
            fetchData();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Delete this group?')) return;
        try {
            await authAPI.adminDeleteGroup(groupId);
            toast.success('Group deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete group');
        }
    };

    return (
        <div className="h-full overflow-auto bg-white p-4 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8 text-slate-900 text-sm">
                {/* Header */}
                <div className="border-b border-slate-200 pb-4">
                    <h1 className="text-xl font-bold">Platform Management</h1>
                    <p className="text-slate-500 text-xs">System administration and monitoring</p>
                </div>

                {/* Ultra-Minimal Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Users', value: stats.totalUsers },
                            { label: 'Groups', value: stats.totalGroups },
                            { label: 'Sections', value: stats.totalResources },
                            { label: 'Meetings', value: stats.totalMeetings },
                        ].map((s) => (
                            <div key={s.label} className="border border-slate-200 p-4 rounded">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                                <h3 className="text-lg font-bold">{s.value}</h3>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="space-y-4">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex border border-slate-200 p-0.5 rounded">
                            <button
                                onClick={() => { setActiveTab('users'); setPage(1); setKeyword(''); }}
                                className={`px-4 py-1.5 text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => { setActiveTab('groups'); setPage(1); setKeyword(''); }}
                                className={`px-4 py-1.5 text-xs font-bold transition-all ${activeTab === 'groups' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                Groups
                            </button>
                        </div>

                        <div className="relative flex-1 max-w-sm w-full">
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 focus:border-slate-900 outline-none"
                                value={keyword}
                                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                            />
                        </div>

                        <div className="text-[10px] font-bold text-slate-400">
                            TOTAL: {totalItems}
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="border border-slate-200 rounded overflow-hidden">
                        {isLoading ? (
                            <div className="p-20 text-center text-xs text-slate-400">Loading...</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2 text-[10px] font-bold uppercase w-12 text-center">#</th>
                                        {activeTab === 'users' ? (
                                            <>
                                                <th className="px-4 py-2 text-[10px] font-bold uppercase">User</th>
                                                <th className="px-4 py-2 text-[10px] font-bold uppercase">Joined</th>

                                            </>
                                        ) : (
                                            <>
                                                <th className="px-4 py-2 text-[10px] font-bold uppercase">Name</th>
                                                <th className="px-4 py-2 text-[10px] font-bold uppercase text-center">Type</th>
                                                <th className="px-4 py-2 text-[10px] font-bold uppercase">Description</th>
                                            </>
                                        )}
                                        <th className="px-4 py-2 text-[10px] font-bold uppercase text-right w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activeTab === 'users' ? (
                                        users.map((u, idx) => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-300 text-center">{(page - 1) * 10 + idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold">{u.lastName} {u.firstName}</div>
                                                    <div className="text-[10px] text-slate-400">{u.email}</div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>

                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-3 font-bold text-[10px] uppercase">
                                                        {u.id !== currentUser?.id && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleBanUser(u.id)}
                                                                    className="text-slate-400 hover:text-slate-900 underline"
                                                                >
                                                                    {u.isDeactivated ? 'UNBAN' : 'BAN'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(u.id)}
                                                                    className="text-slate-400 hover:text-slate-900 underline"
                                                                >
                                                                    DELETE
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        groups.map((g, idx) => (
                                            <tr key={g.groupId} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-300 text-center">{(page - 1) * 10 + idx + 1}</td>
                                                <td className="px-4 py-3 font-bold">{g.groupName}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                        {g.isPublic ? 'PUBLIC' : 'PRIVATE'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-xs">{g.description || '-'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteGroup(g.groupId)}
                                                        className="text-[10px] font-bold text-slate-400 hover:text-slate-900 underline uppercase"
                                                    >
                                                        DELETE
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Simple Pagination */}
                    {totalItems > pageSize && (
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase pt-2">
                            <span>{Math.min(totalItems, (page - 1) * pageSize + 1)}-{Math.min(page * pageSize, totalItems)} of {totalItems}</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="hover:text-slate-900 disabled:opacity-30">PREV</button>
                                <span className="text-slate-900 border border-slate-200 px-2 py-0.5 rounded">PAGE {page} OF {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="hover:text-slate-900 disabled:opacity-30">NEXT</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
