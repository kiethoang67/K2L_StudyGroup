import { Home, Users, MessageSquare, ChevronLeft, MailOpen, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
    const { user } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    let navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
        { icon: MailOpen, label: 'Invitations', path: '/invitations' },
        { icon: Users, label: 'Groups', path: '/groups' },
    ];

    if (user?.isAdmin) {
        navItems = [{ icon: ShieldCheck, label: 'Dashboard', path: '/admin' }];
    }

    return (
        <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300`}>
            {/* Logo Section */}
            <div className={`p-6 min-h-[80px] flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} overflow-hidden`}>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                    }`}>
                    Study Group
                </span>
            </div>

            {/* Toggle Button */}
            <div className="px-0 pb-4 min-h-[48px]">
                <div className="flex items-center justify-end">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`${isCollapsed ? 'mx-auto' : ''} w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors`}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <ChevronLeft className={`w-4 h-4 text-indigo-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'text-teal-500 bg-teal-50'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`
                        }
                        title={isCollapsed ? item.label : undefined}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
