'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { PledgeDetails } from './admin/PledgeDetails';
import { SubmissionDetails } from './admin/SubmissionDetails';
import { ImageGallery } from './admin/ImageGallery';
import type { AdminImageItem } from '@/lib/admin-images';

type Pledge = {
  id: string;
  userId: string | null;
  gcUsername: string;
  title: string | null;
  cacheType: string;
  cacheSize: string;
  approxSuburb: string;
  approxState: string;
  conceptNotes: string | null;
  images: unknown;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    gcUsername: string | null;
  } | null;
  submission: {
    id: string;
    gcCode: string;
    cacheName: string;
    suburb: string;
    state: string;
    difficulty: number;
    terrain: number;
    type: string;
    hiddenDate: string;
    notes: string | null;
    createdAt: string;
  } | null;
};

type Submission = {
  id: string;
  gcCode: string;
  cacheName: string;
  suburb: string;
  state: string;
  difficulty: number;
  terrain: number;
  type: string;
  hiddenDate: string;
  notes: string | null;
  createdAt: string;
  gcUsername: string;
  user: {
    id: string;
    email: string | null;
    gcUsername: string | null;
  } | null;
  pledge: {
    id: string;
    title: string | null;
    gcUsername: string;
    cacheType: string;
    cacheSize: string;
    approxSuburb: string;
    approxState: string;
    status: string;
  } | null;
};

type AuditLog = {
  id: string;
  actorEmail: string | null;
  action: string;
  targetId: string;
  targetKind: string;
  before: unknown;
  after: unknown;
  createdAt: string;
};

type AdminDashboardProps = {
  initialImages: AdminImageItem[];
};

export default function AdminDashboard({ initialImages }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pledges' | 'submissions' | 'audit'>('pledges');
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Pledge | Submission | AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'pledge' | 'submission'; name: string } | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    state: '',
    cacheType: '',
    gcUsername: '',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.state) params.append('state', filters.state);
      if (filters.cacheType) params.append('cacheType', filters.cacheType);
      if (filters.gcUsername) params.append('gcUsername', filters.gcUsername);
      if (filters.search) params.append('search', filters.search);

      if (activeTab === 'pledges') {
        const res = await fetch(`/api/admin/pledges?${params}`);
        const data = await res.json();
        setPledges(data.pledges || []);
      } else if (activeTab === 'submissions') {
        const res = await fetch(`/api/admin/submissions?${params}`);
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } else if (activeTab === 'audit') {
        const res = await fetch(`/api/admin/audit?${params}`);
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.state) params.append('state', filters.state);
      if (filters.cacheType) params.append('cacheType', filters.cacheType);
      if (filters.gcUsername) params.append('gcUsername', filters.gcUsername);
      if (filters.search) params.append('search', filters.search);

      const endpoint = activeTab === 'pledges' ? 'pledges' : 'submissions';
      const res = await fetch(`/api/admin/export/${endpoint}?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `irc26-${endpoint}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export data');
    }
  };

  const handleDeleteClick = (id: string, type: 'pledge' | 'submission', name: string) => {
    setDeleteConfirm({ id, type, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    const { id, type } = deleteConfirm;
    try {
      const endpoint = type === 'pledge' ? 'pledges' : 'submissions';
      const res = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        setIsModalOpen(false);
        setSelectedItem(null);
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-lovely text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link
            href="/"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Back to Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {(['pledges', 'submissions', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {(activeTab === 'pledges' || activeTab === 'submissions') && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All States</option>
            {['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'].map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            value={filters.cacheType}
            onChange={(e) => setFilters({ ...filters, cacheType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Types</option>
            {['TRADITIONAL', 'MULTI', 'MYSTERY', 'LETTERBOX', 'WHERIGO', 'VIRTUAL'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="GC Username"
            value={filters.gcUsername}
            onChange={(e) => setFilters({ ...filters, gcUsername: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {activeTab === 'pledges' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Pledges ({pledges.length})</h2>
                <button
                  onClick={handleExport}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Export CSV
                </button>
              </div>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GC Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pledges.map((pledge) => (
                      <tr key={pledge.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedItem(pledge); setIsModalOpen(true); }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{pledge.gcUsername}</td>
                        <td className="px-6 py-4 text-sm">{pledge.title || 'Untitled'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{pledge.cacheType}</td>
                        <td className="px-6 py-4 text-sm">{pledge.approxSuburb}, {pledge.approxState}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{pledge.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(pledge.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-3">
                            <Link href={`/pledge/${pledge.id}/edit`} className="text-primary-600 hover:text-primary-800">Edit</Link>
                            <button
                              onClick={() => handleDeleteClick(pledge.id, 'pledge', pledge.title || `Pledge by ${pledge.gcUsername}`)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Submissions ({submissions.length})</h2>
                <button
                  onClick={handleExport}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Export CSV
                </button>
              </div>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GC Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cache Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">D/T</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedItem(submission); setIsModalOpen(true); }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{submission.gcCode}</td>
                        <td className="px-6 py-4 text-sm">
                          {submission.cacheName}
                          {submission.gcUsername && (
                            <span className="text-gray-500 ml-2">(@{submission.gcUsername})</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{submission.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{submission.difficulty}/{submission.terrain}</td>
                        <td className="px-6 py-4 text-sm">{submission.suburb}, {submission.state}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(submission.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-3">
                            <Link href={`/submission/${submission.id}/edit`} className="text-primary-600 hover:text-primary-800">Edit</Link>
                            <button
                              onClick={() => handleDeleteClick(submission.id, 'submission', `${submission.gcCode} - ${submission.cacheName}`)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Audit Log ({auditLogs.length})</h2>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedItem(log as Pledge | Submission | AuditLog); setIsModalOpen(true); }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.action}</td>
                        <td className="px-6 py-4 text-sm">{log.targetKind} ({log.targetId.slice(0, 8)}...)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{log.actorEmail || 'System'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">View</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => { setIsModalOpen(false); setSelectedItem(null); }}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Details</h3>
              <button
                onClick={() => { setIsModalOpen(false); setSelectedItem(null); }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4">
              {activeTab === 'pledges' && selectedItem && 'gcUsername' in selectedItem && (
                <PledgeDetails pledge={selectedItem as Pledge} />
              )}
              {activeTab === 'submissions' && selectedItem && 'gcCode' in selectedItem && (
                <SubmissionDetails submission={selectedItem as Submission} />
              )}
              {activeTab === 'audit' && selectedItem && (
                <pre className="text-xs overflow-auto">{JSON.stringify(selectedItem, null, 2)}</pre>
              )}
            </div>
            {('id' in selectedItem) && activeTab !== 'audit' && (
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (activeTab === 'pledges') {
                      const pledge = selectedItem as Pledge;
                      handleDeleteClick(pledge.id, 'pledge', pledge.title || `Pledge by ${pledge.gcUsername}`);
                    } else {
                      const submission = selectedItem as Submission;
                      handleDeleteClick(submission.id, 'submission', `${submission.gcCode} - ${submission.cacheName}`);
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => { setIsModalOpen(false); setSelectedItem(null); }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Gallery Section */}
      <ImageGallery images={initialImages} />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this {deleteConfirm.type}?
              </p>
              <p className="text-sm font-semibold text-gray-900 bg-gray-100 p-3 rounded">
                {deleteConfirm.name}
              </p>
              <p className="text-sm text-red-600 mt-4">
                ⚠️ This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
