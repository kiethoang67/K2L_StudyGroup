import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import OAuth2SuccessPage from '../pages/auth/OAuth2SuccessPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/home/HomePage';
import GroupFocusPage from '../pages/groups/GroupFocusPage';
import DirectChatPage from '../pages/chat/DirectChatPage';
import InvitationsPage from '../pages/invitations/InvitationsPage';
import MeetingRoomPage from '../pages/meetings/MeetingRoomPage';
import AccountSettingsPage from '../pages/settings/AccountSettingsPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import { useEffect } from 'react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!user?.isAdmin) return <Navigate to="/" replace />;
    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore();
    if (!isAuthenticated) return <>{children}</>;
    return <Navigate to={user?.isAdmin ? "/admin" : "/"} replace />;
}

export default function AppRouter() {
    const { isAuthenticated, user, fetchProfile } = useAuthStore();

    // Sync latest user data (including avatarUrl) from backend on every app load
    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated, fetchProfile]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />

                <Route path="/register" element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                } />

                <Route path="/forgot-password" element={
                    <PublicRoute>
                        <ForgotPasswordPage />
                    </PublicRoute>
                } />

                <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />

                {/* Protected Routes */}
                <Route element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                }>
                    <Route path="/" element={user?.isAdmin ? <Navigate to="/admin" replace /> : <HomePage />} />
                    <Route path="/home" element={user?.isAdmin ? <Navigate to="/admin" replace /> : <HomePage />} />
                    <Route path="/groups" element={<DashboardPage />} />
                    <Route path="/chat" element={<DirectChatPage />} />
                    <Route path="/invitations" element={<InvitationsPage />} />
                    <Route path="/settings" element={<AccountSettingsPage />} />
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } />
                </Route>

                {/* Group Focus Route */}
                <Route element={
                    <PrivateRoute>
                        <GroupFocusPage />
                    </PrivateRoute>
                } path="/groups/:groupId" />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
                {/* Meeting Room Route (Full Screen, No Sidebar/Header) */}
                <Route path="/meeting-room" element={
                    <PrivateRoute>
                        <MeetingRoomPage />
                    </PrivateRoute>
                } />

            </Routes>
        </BrowserRouter>
    );
}
