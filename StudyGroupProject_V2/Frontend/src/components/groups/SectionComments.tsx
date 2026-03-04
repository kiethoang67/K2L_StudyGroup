import { useState, useEffect, useCallback } from 'react';
import { commentsAPI, type ListCommentsResponse } from '../../api/comments.api';
import { toast } from 'react-toastify';
import { MessageCircle, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface SectionCommentsProps {
    sectionId: string;
    initialTotal: number;
}

export default function SectionComments({ sectionId, initialTotal }: SectionCommentsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [comments, setComments] = useState<ListCommentsResponse[]>([]);
    const [total, setTotal] = useState(initialTotal);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const PAGE_SIZE = 5;

    const fetchComments = useCallback(async (page: number, append = false) => {
        setIsLoading(true);
        try {
            const res = await commentsAPI.getListComments(sectionId, {
                pageNumber: page,
                pageSize: PAGE_SIZE,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });
            const data = res.data;
            setComments(prev => append ? [...prev, ...data.comments] : data.comments);
            setTotal(data.total);
            setHasMore(page * PAGE_SIZE < data.total);
        } catch {
            toast.error('Failed to load comments.');
        } finally {
            setIsLoading(false);
        }
    }, [sectionId]);

    // Load comments when user first expands the section
    useEffect(() => {
        if (isOpen && comments.length === 0) {
            fetchComments(1);
        }
    }, [isOpen, comments.length, fetchComments]);

    const handleLoadMore = () => {
        const nextPage = pageNumber + 1;
        setPageNumber(nextPage);
        fetchComments(nextPage, true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await commentsAPI.createComment(sectionId, { content: newComment.trim() });
            // Prepend the new comment so it appears at top (desc order)
            const created = res.data;
            setComments(prev => [{
                commentId: created.commentId,
                content: created.content,
                creatorInfo: created.creatorInfo,
            }, ...prev]);
            setTotal(t => t + 1);
            setNewComment('');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Comment failed!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-3 border-t border-gray-100 pt-3">
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors"
            >
                <MessageCircle className="w-4 h-4" />
                <span>{total} {total <= 1 ? 'comment' : 'comments'}</span>
                {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                )}
            </button>

            {isOpen && (
                <div className="mt-3 space-y-3">
                    {/* Input form */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send comment"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </form>

                    {/* Comment list */}
                    {isLoading && comments.length === 0 ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-2">
                            No comments yet. Be the first!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {comments.map(c => (
                                <div key={c.commentId} className="flex items-start gap-2.5">
                                    <img
                                        src={
                                            c.creatorInfo?.avatarUrl ||
                                            `https://ui-avatars.com/api/?name=${c.creatorInfo?.firstName}+${c.creatorInfo?.lastName}&background=random`
                                        }
                                        alt="avatar"
                                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                                    />
                                    <div className="bg-gray-50 rounded-xl px-3 py-2 text-sm flex-1">
                                        <span className="font-medium text-gray-700 mr-2">
                                            {c.creatorInfo?.firstName} {c.creatorInfo?.lastName}
                                        </span>
                                        <span className="text-gray-700">{c.content}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Load more */}
                            {hasMore && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="w-full text-xs text-teal-600 hover:text-teal-700 font-medium py-1 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                                    ) : (
                                        'View more comments...'
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
