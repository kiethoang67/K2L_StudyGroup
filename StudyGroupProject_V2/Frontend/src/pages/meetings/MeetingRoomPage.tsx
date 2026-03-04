import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuthStore } from '../../store/authStore';

export default function MeetingRoomPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const zegoRef = useRef<any>(null);

    const roomID = searchParams.get('roomId') ?? 'default-room';
    const groupId = searchParams.get('groupId') ?? '';

    useEffect(() => {
        if (!user || !containerRef.current) return;

        const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET as string;

        // ZegoCloud restricts userID to max 32 bytes and roomID to max 128 bytes.
        // Also, no special characters are allowed (only numbers, English letters, and '-', '_').
        const rawUserId = user.id ? user.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32) : 'guest';
        const userID = rawUserId || 'guest';
        const rawRoomId = searchParams.get('roomId') ?? 'default-room';
        const roomID = rawRoomId.replace(/[^a-zA-Z0-9_-]/g, '') || 'default-room';
        const userName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || 'Guest';

        if (!appID || !serverSecret) {
            console.error("ZegoCloud AppID or ServerSecret is missing. Please check .env variables or restart the Vite server.");
            return;
        }

        console.log("--- ZegoCloud Debug ---");
        console.log("AppID type:", typeof appID, "value:", appID);
        console.log("ServerSecret length:", serverSecret.length, "value (first 5 chars):", serverSecret.substring(0, 5));
        console.log("UserID:", userID);
        console.log("RoomID:", roomID);
        console.log("-----------------------");

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomID,
            userID,
            userName
        );

        const zego = ZegoUIKitPrebuilt.create(kitToken);
        zegoRef.current = zego;

        zego.joinRoom({
            container: containerRef.current,
            scenario: {
                mode: ZegoUIKitPrebuilt.VideoConference,
            },
            showPreJoinView: true,
            onLeaveRoom: () => {
                if (groupId) {
                    navigate(`/groups/${groupId}`);
                } else {
                    navigate('/groups');
                }
            },
        });

        return () => {
            try {
                zegoRef.current?.destroy();
            } catch { /* ignore cleanup errors */ }
        };
    }, [user, roomID, groupId, navigate]);

    return (
        <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
