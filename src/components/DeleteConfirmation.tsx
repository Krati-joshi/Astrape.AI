import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  itemName: string;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ 
  onConfirm, 
  onCancel, 
  itemName 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto animate-fadeIn">
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Delete {itemName}
            </h2>
            <p className="text-gray-600">
              Are you sure you want to delete this {itemName.toLowerCase()}? This action cannot be undone.
            </p>
          </div>
          
          <div className="flex justify-center gap-3 mt-6">
            <button 
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="btn btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;