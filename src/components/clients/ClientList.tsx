import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { NewClientModal } from './NewClientModal';
import { EditClientModal } from './EditClientModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { ClientInput } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Client = {
  id: string;
  company_name: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  user_id: string;
  created_at: string;
};

export const ClientList: React.FC = () => {
  const { user } = useAuth();
  // We'll keep searchTerm for filtering but remove the setter since it's not being used in the UI currently
  const searchTerm = '';
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => 
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (clientData: ClientInput) => {
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: user?.id
        });

      if (error) throw error;
      setShowNewModal(false);
      fetchClients(); // Refresh the list
    } catch (err) {
      console.error('Error creating client:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDeletingClient(null);
      fetchClients(); // Refresh the list
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-0 bg-[#121212]">

        {/* Desktop list */}
        <div className="hidden md:block">
          {isLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <div className="bg-[#121212] rounded-[4px] shadow overflow-hidden">
              <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
                <table className="min-w-full divide-y divide-[#333333]">
                  <thead className="bg-[#1E1E1E] sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                        COMPANY
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                        CONTACT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                        EMAIL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                        PHONE
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#121212] divide-y divide-[#333333]">
                    {filteredClients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#FFFFFF] font-['Roboto']">
                            {client.company_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#FFFFFF] font-['Roboto']">{client.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#9E9E9E] font-['Roboto']">{client.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#9E9E9E] font-['Roboto_Mono'] font-medium">{client.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Dropdown
                            trigger={
                              <button className="text-[#9E9E9E] hover:text-[#F9D71C]">
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
                                className: 'text-[#D32F2F] hover:bg-[#D32F2F]/10 hover:text-[#D32F2F]',
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
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-[#333333] rounded-[4px] shadow p-4 border-l-4 border-[#336699]"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#FFFFFF] font-['Roboto_Condensed'] uppercase">
                        {client.company_name}
                      </h3>
                      <p className="text-xs text-[#9E9E9E] font-['Roboto'] mt-1">
                        {client.name}
                      </p>
                      <span className="text-sm text-[#336699] mt-2 block font-['Roboto']">
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="text-xs text-[#9E9E9E] mt-1 block font-['Roboto_Mono'] font-medium">
                          {client.phone}
                        </span>
                      )}
                    </div>
                    <Dropdown
                      trigger={
                        <button className="ml-4 p-1 text-[#9E9E9E] hover:text-[#F9D71C]">
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
                          className: 'text-[#D32F2F] hover:bg-[#D32F2F]/10 hover:text-[#D32F2F]'
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
          onConfirm={() => handleDelete(deletingClient.id)}
          onCancel={() => setDeletingClient(null)}
        />
      )}
    </DashboardLayout>
  );
};
