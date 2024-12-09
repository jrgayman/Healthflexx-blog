```jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

export default function ClinicForm({ clinic = null, providerId, buildings, onClose, onSave }) {
  const [managers, setManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState(clinic?.telehealth_clinic_managers?.map(m => m.users.id) || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailableManagers();
  }, []);

  async function fetchAvailableManagers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('healthcare_provider_id', providerId)
        .order('name');

      if (error) throw error;
      setManagers(data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to load available managers');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const clinicData = {
        name: formData.get('name'),
        building_id: formData.get('building_id'),
        healthcare_provider_id: providerId,
        active: formData.get('active') === 'on'
      };

      let clinicId;
      if (clinic) {
        const { error: updateError } = await supabase
          .from('telehealth_clinics')
          .update(clinicData)
          .eq('id', clinic.id);

        if (updateError) throw updateError;
        clinicId = clinic.id;
      } else {
        const { data, error: insertError } = await supabase
          .from('telehealth_clinics')
          .insert([clinicData])
          .select()
          .single();

        if (insertError) throw insertError;
        clinicId = data.id;
      }

      // Update manager assignments
      if (clinic) {
        const { error: deleteError } = await supabase
          .from('telehealth_clinic_managers')
          .delete()
          .eq('clinic_id', clinicId);

        if (deleteError) throw deleteError;
      }

      if (selectedManagers.length > 0) {
        const { error: managerError } = await supabase
          .from('telehealth_clinic_managers')
          .insert(selectedManagers.map(managerId => ({
            clinic_id: clinicId,
            user_id: managerId
          })));

        if (managerError) throw managerError;
      }

      toast.success(clinic ? 'Clinic updated!' : 'Clinic created!');
      onSave();
    } catch (error) {
      console.error('Error saving clinic:', error);
      toast.error('Failed to save clinic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {clinic ? 'Edit Clinic' : 'Add Clinic'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              defaultValue={clinic?.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Building</label>
            <select
              name="building_id"
              defaultValue={clinic?.building_id || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Select Building</option>
              {buildings.map(building => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Managers</label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {managers.map(manager => (
                <label key={manager.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedManagers.includes(manager.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedManagers([...selectedManagers, manager.id]);
                      } else {
                        setSelectedManagers(selectedManagers.filter(id => id !== manager.id));
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {manager.name} ({manager.email})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="active"
                defaultChecked={clinic?.active ?? true}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (clinic ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```