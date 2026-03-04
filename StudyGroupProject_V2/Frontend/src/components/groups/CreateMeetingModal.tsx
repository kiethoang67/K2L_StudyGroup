import { useState } from 'react';
import { X, Calendar, Clock, AlignLeft, Type } from 'lucide-react';
import { meetingsAPI, type CreateMeetingRequest } from '../../api/meetings.api';
import { toast } from 'react-toastify';

interface CreateMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    onSuccess: () => void;
}

export default function CreateMeetingModal({ isOpen, onClose, groupId, onSuccess }: CreateMeetingModalProps) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        startedAt: '',
        endedAt: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.startedAt || !form.endedAt) return;

        const start = new Date(form.startedAt);
        const end = new Date(form.endedAt);
        if (end <= start) {
            toast.error('End time must be after start time');
            return;
        }

        // Format Date to "yyyy-MM-dd hh:mm a" matching Java backend @JsonFormat(pattern = "yyyy-MM-dd hh:mm a")
        // Example: 2026-02-26 02:45 PM
        const formatDateTime = (dateObj: Date) => {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            let hours = dateObj.getHours();
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const strHours = String(hours).padStart(2, '0');
            return `${year}-${month}-${day} ${strHours}:${minutes} ${ampm}`;
        };

        const payload: CreateMeetingRequest = {
            title: form.title,
            description: form.description,
            startedAt: formatDateTime(start),
            endedAt: formatDateTime(end),
        };

        setIsLoading(true);
        try {
            await meetingsAPI.createMeeting(groupId, payload);
            toast.success('Meeting created successfully!');
            setForm({ title: '', description: '', startedAt: '', endedAt: '' });
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to create meeting';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-500 to-cyan-500">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Create New Meeting
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <Type className="w-3.5 h-3.5" /> Meeting Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g.: Weekly Meeting Week 3..."
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <AlignLeft className="w-3.5 h-3.5" /> Description
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Meeting content..."
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    {/* Start time */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <Clock className="w-3.5 h-3.5" /> Starts at *
                        </label>
                        <input
                            type="datetime-local"
                            name="startedAt"
                            value={form.startedAt}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* End time */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <Clock className="w-3.5 h-3.5" /> Ends at *
                        </label>
                        <input
                            type="datetime-local"
                            name="endedAt"
                            value={form.endedAt}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium transition-colors disabled:opacity-50 text-sm"
                        >
                            <Calendar className="w-4 h-4" />
                            {isLoading ? 'Creating...' : 'Create Meeting'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
