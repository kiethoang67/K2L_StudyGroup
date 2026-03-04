import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
    return (
        <div className="flex bg-gray-50 h-screen w-screen overflow-hidden">
            <div className="flex-shrink-0 h-full z-30">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-full">
                <Header />
                <main className="flex-1 overflow-hidden relative h-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
