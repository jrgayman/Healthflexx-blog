```jsx
import React from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

export default function ClinicList({ clinics, onEdit, onUpdate }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clinic?')) return;

    try {
      const { error } = await supabase
        .from('telehealth_clinics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Clinic deleted');
      onUpdate();
    } catch (error) {
      console.error('Error deleting clinic:', error);
      toast.error('Failed to delete clinic');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Managers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clinics.map((clinic) => (
              <tr key={clinic.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{clinic.buildings?.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {clinic.telehealth_clinic_managers?.map(manager => (
                      <div key={manager.users.id}>
                        {manager.users.name}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    clinic.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {clinic.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button
                    onClick={() => onEdit(clinic)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(clinic.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```