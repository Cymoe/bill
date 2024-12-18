import React, { useState } from 'react';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { NewClientModal } from './NewClientModal';
import { EditClientModal } from './EditClientModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { ClientInput } from '../../lib/database.types';

type Client = Doc<"clients">;

export const ClientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const clients = useQuery(api.clients.getClients);
  const createClient = useMutation(api.clients.createClient);
  const deleteClient = useMutation(api.clients.deleteClient);

  const isLoading = !clients;

  const filteredClients = (clients || []).filter((client: Client) => 
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (clientData: ClientInput) => {
    await createClient(clientData);
    setShowNewModal(false);
  };

  const handleDelete = async (id: Id<"clients">) => {
    await deleteClient({ id });
    setDeletingClient(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <Breadcrumbs items={[{ label: 'Clients', href: '/clients' }]} />
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>New Client</span>
          </button>
        </div>

        {/* Desktop list */}
        <div className="hidden md:block">
          {isLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredClients.map((client) => (
                      <tr key={client._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.company}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{client.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">{client.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">{client.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Dropdown
                            trigger={
                              <button className="text-gray-400 hover:text-gray-500">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            }
                            items={[
                              {
                                label: 'Edit',
                                onClick: () => setEditingClient(client),
                              },
                              {
                                label: 'Delete',
                                onClick: () => setDeletingClient(client),
                                className: 'text-red-600 hover:text-red-700',
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Mobile list */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <div className="space-y-4 pb-20">
              {filteredClients.map((client) => (
                <div
                  key={client._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {client.company}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {client.name}
                      </p>
                      <span className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 block">
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                          {client.phone}
                        </span>
                      )}
                    </div>
                    <Dropdown
                      trigger={
                        <button className="ml-4 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      }
                      items={[
                        {
                          label: 'Edit',
                          onClick: () => setEditingClient(client)
                        },
                        {
                          label: 'Delete',
                          onClick: () => setDeletingClient(client),
                          className: 'text-red-600 hover:text-red-700'
                        }
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <NewClientModal
          onClose={() => setShowNewModal(false)}
          onSave={handleSave}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSave={() => setEditingClient(null)}
        />
      )}

      {deletingClient && (
        <DeleteConfirmationModal
          title="Delete Client"
          message="Are you sure you want to delete this client? This action cannot be undone."
          onConfirm={() => handleDelete(deletingClient._id)}
          onCancel={() => setDeletingClient(null)}
        />
      )}
    </DashboardLayout>
  );
};
