import { useState, useEffect } from 'react';
import { X, Paperclip, Loader2 } from 'lucide-react';
import { sectionsAPI, type ListSectionsResponse } from '../../api/sections.api';
import { toast } from 'react-toastify';

interface EditSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    section: ListSectionsResponse | null;
    onSuccess: () => void;
}

export default function EditSectionModal({ isOpen, onClose, section, onSuccess }: EditSectionModalProps) {
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (section && isOpen) {
            setContent(section.content || '');
            setAttachments(section.attachments || []);
        }
    }, [section, isOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !section) return;

        setIsUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of Array.from(files)) {
                // We use sectionId as prefix for editing
                const res = await sectionsAPI.generatePresignUrlAttachment(section.sectionId, { fileName: file.name, contentType: file.type });
                const { urlUpload, publicUrl } = res.data;

                const uploadRes = await fetch(urlUpload, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type },
                    credentials: 'omit',
                });

                if (!uploadRes.ok) {
                    throw new Error(`Upload failed with status: ${uploadRes.status}`);
                }

                uploadedUrls.push(publicUrl);
            }
            setAttachments(prev => [...prev, ...uploadedUrls]);
            toast.success(`Uploaded ${uploadedUrls.length} file(s)!`);
        } catch (error) {
            console.error(error);
            toast.error('File upload failed, please try again.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!section) return;
        if (!content.trim()) {
            toast.error('Please enter section content');
            return;
        }

        setIsSubmitting(true);
        try {
            await sectionsAPI.editSection(section.sectionId, {
                content: content.trim(),
                attachments,
            });
            toast.success('Section updated successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update section!';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !section) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Edit Section</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    {/* Content */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all resize-none"
                            rows={6}
                            placeholder="Enter section content..."
                        />
                    </div>

                    {/* Attachments */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Attachments
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium">
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Paperclip className="w-4 h-4" />
                                )}
                                {isUploading ? 'Uploading...' : 'Choose new files'}
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>

                        {/* Attachment list */}
                        {attachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {attachments.map((url, index) => {
                                    const fileName = url.split('/').pop() || `File ${index + 1}`;
                                    const cleanFileName = fileName.split('_').slice(1).join('_') || fileName;
                                    return (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-teal-600 hover:underline truncate max-w-sm"
                                            >
                                                {cleanFileName}
                                            </a>
                                            <button
                                                onClick={() => removeAttachment(index)}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
