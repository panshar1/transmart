// FIX: Import `useEffect` from `react` as it was missing.
import React, { useState, useMemo, useEffect } from 'react';
import type { User } from '../types';
import { PlusIcon, SearchIcon, TrashIcon } from './Icons';
import Modal from './Modal';

interface UserManagementProps {
  users: User[];
  onAddUser: (name: string, email: string, role: User['role'], costPerWord?: number, agencyId?: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UserCard: React.FC<{ user: User; onDelete: (userId: string) => void }> = ({ user, onDelete }) => {
  const roleColors: Record<User['role'], string> = {
    admin: 'bg-rose-100 text-rose-800',
    lpm: 'bg-indigo-100 text-indigo-800',
    vendor: 'bg-green-100 text-green-800',
    translator: 'bg-cyan-100 text-cyan-800'
  };

  const roleDisplay: Record<User['role'], string> = {
      admin: 'Admin',
      lpm: 'LPM',
      vendor: 'Vendor Agency',
      translator: 'Translator'
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex items-center gap-4 group">
        <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full" />
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
              {roleDisplay[user.role]}
            </span>
             {user.role === 'vendor' && typeof user.costPerWord === 'number' && (
                <span className="text-xs text-gray-500 font-medium">
                    ${user.costPerWord.toFixed(2)} / word
                </span>
            )}
          </div>
        </div>
        <button 
            onClick={() => onDelete(user.id)}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Delete user ${user.name}`}
            title={`Delete ${user.name}`}
        >
            <TrashIcon className="w-5 h-5" />
        </button>
    </div>
  );
};

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<User['role']>('translator');
  const [userCost, setUserCost] = useState(0.10);
  const [userAgency, setUserAgency] = useState('');
  
  const [filterRole, setFilterRole] = useState<'all' | User['role']>('all');
  const [filterKeyword, setFilterKeyword] = useState('');

  const vendors = useMemo(() => users.filter(u => u.role === 'vendor'), [users]);
  
  useEffect(() => {
    if (vendors.length > 0 && !userAgency) {
      setUserAgency(vendors[0].id);
    }
  }, [vendors, userAgency]);


  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (filterRole !== 'all' && user.role !== filterRole) return false;
      if (filterKeyword) {
        const keyword = filterKeyword.toLowerCase();
        if (!user.name.toLowerCase().includes(keyword) && !user.email.toLowerCase().includes(keyword)) {
          return false;
        }
      }
      return true;
    });
  }, [users, filterRole, filterKeyword]);

  const handleAddUser = () => {
    if (userName.trim() && userEmail.trim()) {
      const cost = userRole === 'vendor' ? userCost : undefined;
      const agency = userRole === 'translator' ? userAgency : undefined;
      onAddUser(userName.trim(), userEmail.trim(), userRole, cost, agency);
      setUserName('');
      setUserEmail('');
      setUserRole('translator');
      setUserCost(0.10);
      setIsModalOpen(false);
    }
  };
  
  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        onDeleteUser(userId);
    }
  }

  return (
    <div className="p-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="bg-info-bg p-4 border-l-4 border-accent rounded-t-lg flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">People</h1>
            <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
            <PlusIcon className="w-5 h-5" />
            Add User
            </button>
        </div>

        <div className="p-6">
            <div className="p-4 bg-gray-50 border rounded-lg mb-6 flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Filter by:</span>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value as any)} className="bg-white text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent">
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="lpm">LPM</option>
                    <option value="vendor">Vendor Agency</option>
                    <option value="translator">Translator</option>
                </select>
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={filterKeyword}
                        onChange={e => setFilterKeyword(e.target.value)}
                        className="w-full bg-white text-gray-800 p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredUsers.length > 0 ? (
                filteredUsers.map(user => <UserCard key={user.id} user={user} onDelete={handleDelete} />)
            ) : (
                <p className="text-gray-500 col-span-full text-center py-10">No users match the current filters.</p>
            )}
            </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <div className="space-y-4">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Full Name"
            className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="user-role"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as User['role'])}
              className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="translator">Translator</option>
              <option value="vendor">Vendor Agency</option>
              <option value="lpm">LPM</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {userRole === 'vendor' && (
            <div>
              <label htmlFor="user-cost" className="block text-sm font-medium text-gray-700 mb-1">Cost Per Word (USD)</label>
              <input
                id="user-cost" type="number" step="0.01" min="0" value={userCost}
                onChange={(e) => setUserCost(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 0.12"
                className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}
          {userRole === 'translator' && (
            <div>
              <label htmlFor="user-agency" className="block text-sm font-medium text-gray-700 mb-1">Assign to Agency</label>
              <select
                id="user-agency" value={userAgency}
                onChange={(e) => setUserAgency(e.target.value)}
                className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          )}
          <button
            onClick={handleAddUser}
            className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Invite User
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;