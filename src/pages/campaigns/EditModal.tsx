import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Campaign {
  id: string;
  name: string;
  description: string;
  category: string;
  [key: string]: any;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  loading: boolean;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const EditModal = ({ isOpen, onClose, title, value, onChange, onSave, loading }: EditModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4 min-h-[100px]"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-register-green text-white rounded-md"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeleteModal = ({ isOpen, onClose, onConfirm, loading }: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Delete Campaign</h2>
        <p className="mb-6">Are you sure you want to delete this campaign? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-register-red text-white rounded-md"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const useCampaignActions = (campaign: Campaign | null) => {
  const navigate = useNavigate();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editField, setEditField] = useState<'name' | 'category' | 'description' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEditClick = (field: 'name' | 'category' | 'description') => {
    if (!campaign) return;
    
    setEditField(field);
    setEditValue(campaign[field]);
  };

  const handleSaveEdit = async () => {
    if (!campaign || !editField) return null;
    
    setUpdateLoading(true);
    try {
      const docRef = doc(db, 'campaigns', campaign.id);
      await updateDoc(docRef, {
        [editField]: editValue
      });
      
      setEditField(null);
      // Return a partial object with just the updated field
      return { 
        [editField]: editValue 
      };
    } catch (error) {
      console.error('Error updating campaign:', error);
      return null;
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'campaigns', campaign.id));
      setIsDeleteModalOpen(false);
      navigate('/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    editField,
    setEditField, // Add this to the returned object
    editValue,
    setEditValue,
    updateLoading,
    deleteLoading,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleEditClick,
    handleSaveEdit,
    handleDeleteCampaign
  };
};