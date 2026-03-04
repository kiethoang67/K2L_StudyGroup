// useState removed
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { groupsAPI } from '../../api/groups.api';
import { toast } from 'react-toastify';
import MultiSelect from '../common/MultiSelect';
import { INTEREST_OPTIONS } from '../../constants/interests';

const createGroupSchema = z.object({
    name: z.string().min(3, 'Group name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    tags: z.array(z.string()).min(1, 'Please select at least 1 tag'),
    isPublic: z.boolean(),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<CreateGroupFormData>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            name: '',
            description: '',
            tags: [],
            isPublic: true,
        },
    });

    const onSubmit = async (data: CreateGroupFormData) => {
        try {
            await groupsAPI.createGroup(data);
            toast.success('Group created successfully!');
            reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create group');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Create New Group</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Enter group name"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            {...register('description')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
                            placeholder="Describe your group..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags / Interests</label>
                        <MultiSelect
                            options={INTEREST_OPTIONS}
                            value={watch('tags')}
                            onChange={(val) => setValue('tags', val, { shouldValidate: true })}
                            placeholder="Select tags"
                        />
                        {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags.message}</p>}
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            {...register('isPublic')}
                            id="isPublic"
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-700 select-none">
                            Public Group (Anyone can join)
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
