import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import FilterDropdown from '../../../components/FilterDropdown';
import toast from 'react-hot-toast';

export default function Admin() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchBuildings();
      fetchClinics();
    } else {
      setBuildings([]);
      setClinics([]);
    }
  }, [selectedProvider]);

  async function fetchProviders() {
    try {
      const { data, error } = await supabase
        .from('healthcare_providers')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBuildings() {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name')
        .eq('healthcare_provider_id', selectedProvider)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Failed to load buildings');
    }
  }

  async function fetchClinics() {
    try {
      const { data, error } = await supabase
        .from('telehealth_clinics')
        .select(`
          *,
          buildings (
            id,
            name
          ),
          telehealth_clinic_managers (
            users (
              id,
              name,
              email
            )
          )
        `)
        .eq('healthcare_provider_id', selectedProvider)
        .order('name');

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      toast.error('Failed to load clinics');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const clinicData = {
        name: formData.get('name'),
        building_id: formData.get('building_id'),
        healthcare_provider_id: selectedProvider,
        active: formData.get('active') === 'on'
      };

      let error;
      if (selectedClinic) {
        ({ error } = await supabase
          .from('telehealth_clinics')
          .update(clinicData)
          .eq('id', selectedClinic.id));
      } else {
        ({ error } = await supabase
          .from('telehealth_clinics')
          .insert([clinicData]));
      }

      if (error) throw error;

      toast.success(selectedClinic ? 'Clinic updated!' : 'Clinic added!');
      setIsModalOpen(false);
      setSelectedClinic(null);
      fetchClinics();
    } catch (error) {
      console.error('Error saving clinic:', error);
      toast.error('Failed to save clinic');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Telehealth Administration</h1>
      </div>

      <div className="mb-8">
        <FilterDropdown
          label="Healthcare Provider"
          value={selectedProvider}
          onChange={setSelectedProvider}
          options={providers.map(provider => ({
            value: provider.id,
            label: provider.name
          }))}
        />
      </div>

      {selectedProvider && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Telehealth Clinics</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              Add Clinic
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        clinic.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {clinic.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => {
                          setSelectedClinic(clinic);
                          setIsModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedClinic ? 'Edit Clinic' : 'Add Clinic'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedClinic(null);
                }}
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
                  defaultValue={selectedClinic?.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Building</label>
                <select
                  name="building_id"
                  defaultValue={selectedClinic?.building_id || ''}
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
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={selectedClinic?.active ?? true}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedClinic(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  {selectedClinic ? 'Update Clinic' : 'Add Clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}