'use client';

import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/auth/ApiClient';

interface ShippingMethod {
  _id?: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
  minOrderValue?: number;
  maxWeight?: number;
  regions: string[];
}

interface ShippingZone {
  _id: string;
  name: string;
  description?: string;
  regions: string[];
  methods: ShippingMethod[];
  isActive: boolean;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ShippingStats {
  totalZones: number;
  activeZones: number;
  totalMethods: number;
  activeMethods: number;
}

export default function AdminShipping() {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [stats, setStats] = useState<ShippingStats>({
    totalZones: 0,
    activeZones: 0,
    totalMethods: 0,
    activeMethods: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [includeInactive, setIncludeInactive] = useState(false);

  const [newZone, setNewZone] = useState<Partial<ShippingZone>>({
    name: '',
    description: '',
    regions: [],
    methods: [],
    isActive: true,
    priority: 0
  });

  const [newMethod, setNewMethod] = useState<Partial<ShippingMethod>>({
    name: '',
    description: '',
    price: 0,
    estimatedDays: '',
    isActive: true,
    minOrderValue: 0,
    maxWeight: undefined,
    regions: []
  });

  useEffect(() => {
    fetchShippingData();
  }, [includeInactive]);

  const fetchShippingData = async () => {
    try {
      setIsLoading(true);
      const queryParams = includeInactive ? '?includeInactive=true' : '';
      const response = await ApiClient.get(`/api/admin/shipping${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        setShippingZones(data.shippingZones || []);
        setStats(data.stats || {
          totalZones: 0,
          activeZones: 0,
          totalMethods: 0,
          activeMethods: 0
        });
      } else {
        console.error('Failed to fetch shipping data:', await response.text());
        setShippingZones([]);
      }
    } catch (error) {
      console.error('Failed to fetch shipping data:', error);
      setShippingZones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createShippingZone = async () => {
    try {
      if (!newZone.name || !newZone.regions || newZone.regions.length === 0) {
        alert('Zone name and at least one region are required');
        return;
      }

      const response = await ApiClient.post('/api/admin/shipping', newZone);

      if (response.ok) {
        await fetchShippingData();
        setNewZone({
          name: '',
          description: '',
          regions: [],
          methods: [],
          isActive: true,
          priority: 0
        });
        setShowAddZone(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create shipping zone');
      }
    } catch (error) {
      console.error('Failed to create shipping zone:', error);
      alert('Failed to create shipping zone');
    }
  };

  const deleteShippingZone = async (zoneId: string) => {
    try {
      if (!confirm('Are you sure you want to delete this shipping zone?')) {
        return;
      }

      const response = await ApiClient.delete('/api/admin/shipping', {
        body: JSON.stringify({ zoneId }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchShippingData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete shipping zone');
      }
    } catch (error) {
      console.error('Failed to delete shipping zone:', error);
      alert('Failed to delete shipping zone');
    }
  };

  const addMethodToZone = async () => {
    try {
      if (!selectedZoneId || !newMethod.name || !newMethod.price) {
        alert('Zone, method name, and price are required');
        return;
      }

      const zone = shippingZones.find(z => z._id === selectedZoneId);
      if (!zone) return;

      const updatedMethods = [...zone.methods, {
        ...newMethod,
        name: newMethod.name!,
        description: newMethod.description || '',
        price: newMethod.price!,
        estimatedDays: newMethod.estimatedDays || '',
        isActive: newMethod.isActive !== undefined ? newMethod.isActive : true,
        regions: newMethod.regions || []
      }];

      const response = await ApiClient.put('/api/admin/shipping', {
        zoneId: selectedZoneId,
        methods: updatedMethods
      });

      if (response.ok) {
        await fetchShippingData();
        setNewMethod({
          name: '',
          description: '',
          price: 0,
          estimatedDays: '',
          isActive: true,
          minOrderValue: 0,
          maxWeight: undefined,
          regions: []
        });
        setShowAddMethod(false);
        setSelectedZoneId('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add shipping method');
      }
    } catch (error) {
      console.error('Failed to add shipping method:', error);
      alert('Failed to add shipping method');
    }
  };

  const toggleZoneStatus = async (zoneId: string) => {
    try {
      const zone = shippingZones.find(z => z._id === zoneId);
      if (!zone) return;

      const response = await ApiClient.put('/api/admin/shipping', {
        zoneId,
        isActive: !zone.isActive
      });

      if (response.ok) {
        await fetchShippingData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update zone status');
      }
    } catch (error) {
      console.error('Failed to update zone status:', error);
      alert('Failed to update zone status');
    }
  };

  const toggleMethodStatus = async (zoneId: string, methodIndex: number) => {
    try {
      const zone = shippingZones.find(z => z._id === zoneId);
      if (!zone) return;

      const updatedMethods = [...zone.methods];
      updatedMethods[methodIndex].isActive = !updatedMethods[methodIndex].isActive;

      const response = await ApiClient.put('/api/admin/shipping', {
        zoneId,
        methods: updatedMethods
      });

      if (response.ok) {
        await fetchShippingData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update method status');
      }
    } catch (error) {
      console.error('Failed to update method status:', error);
      alert('Failed to update method status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shipping settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Management</h1>
          <p className="text-gray-600">Manage shipping zones, methods, and pricing</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddZone(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Zone
          </button>
          <button
            onClick={() => setShowAddMethod(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Method
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalZones}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeZones}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Methods</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMethods}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Methods</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeMethods}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Include inactive zones</span>
        </label>
      </div>

      {/* Shipping Zones */}
      <div className="space-y-6">
        {shippingZones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No shipping zones found</p>
            <button
              onClick={() => setShowAddZone(true)}
              className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create First Zone
            </button>
          </div>
        ) : (
          shippingZones.map((zone) => (
            <div key={zone._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-900">{zone.name}</h2>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        zone.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {zone.description && (
                    <p className="text-gray-600 mt-1">{zone.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {zone.regions.map((region, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleZoneStatus(zone._id)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      zone.isActive
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {zone.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteShippingZone(zone._id)}
                    className="text-red-600 hover:bg-red-50 px-3 py-1 text-sm font-medium rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Shipping Methods */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Shipping Methods ({zone.methods.length})</h3>
                {zone.methods.length === 0 ? (
                  <p className="text-gray-500 text-sm">No shipping methods added yet</p>
                ) : (
                  zone.methods.map((method, methodIndex) => (
                    <div
                      key={methodIndex}
                      className={`border rounded-lg p-4 ${
                        method.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">{method.name}</h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                method.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {method.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm font-medium text-gray-900">
                              Price: {formatCurrency(method.price)}
                            </span>
                            <span className="text-sm text-gray-600">
                              Estimated: {method.estimatedDays}
                            </span>
                            {method.minOrderValue && method.minOrderValue > 0 && (
                              <span className="text-sm text-gray-600">
                                Min Order: {formatCurrency(method.minOrderValue)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleMethodStatus(zone._id, methodIndex)}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              method.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {method.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Zone Modal */}
      {showAddZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Shipping Zone</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={newZone.name || ''}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Local Zone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newZone.description || ''}
                  onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the shipping zone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regions (comma-separated)
                </label>
                <input
                  type="text"
                  value={newZone.regions?.join(', ') || ''}
                  onChange={(e) => setNewZone({ 
                    ...newZone, 
                    regions: e.target.value.split(',').map(r => r.trim()).filter(r => r) 
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Chennai, Bangalore, Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (higher number = higher priority)
                </label>
                <input
                  type="number"
                  value={newZone.priority || 0}
                  onChange={(e) => setNewZone({ ...newZone, priority: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newZone.isActive || false}
                  onChange={(e) => setNewZone({ ...newZone, isActive: e.target.checked })}
                  className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active by default
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddZone(false);
                  setNewZone({
                    name: '',
                    description: '',
                    regions: [],
                    methods: [],
                    isActive: true,
                    priority: 0
                  });
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createShippingZone}
                disabled={!newZone.name || !newZone.regions || newZone.regions.length === 0}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                Create Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Method Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Shipping Method</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Select a zone</option>
                  {shippingZones.filter(zone => zone.isActive).map((zone) => (
                    <option key={zone._id} value={zone._id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Method Name
                </label>
                <input
                  type="text"
                  value={newMethod.name || ''}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Express Delivery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newMethod.description || ''}
                  onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the shipping method"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newMethod.price || 0}
                    onChange={(e) => setNewMethod({ ...newMethod, price: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Days
                  </label>
                  <input
                    type="text"
                    value={newMethod.estimatedDays || ''}
                    onChange={(e) => setNewMethod({ ...newMethod, estimatedDays: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., 2-3 days"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  value={newMethod.minOrderValue || 0}
                  onChange={(e) => setNewMethod({ ...newMethod, minOrderValue: Number(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                  placeholder="Optional minimum order value"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMethod.isActive || false}
                  onChange={(e) => setNewMethod({ ...newMethod, isActive: e.target.checked })}
                  className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active by default
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMethod(false);
                  setSelectedZoneId('');
                  setNewMethod({
                    name: '',
                    description: '',
                    price: 0,
                    estimatedDays: '',
                    isActive: true,
                    minOrderValue: 0,
                    maxWeight: undefined,
                    regions: []
                  });
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addMethodToZone}
                disabled={!selectedZoneId || !newMethod.name || !newMethod.price}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                Add Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}