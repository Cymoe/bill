import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../common/PageHeader';
import { NewButton } from '../common/NewButton';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { Dropdown } from '../common/Dropdown';
import { formatCurrency } from '../../utils/format';

type Project = Tables['projects'];

export const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsData = await db.projects.list();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-[#388E3C] text-[#6BFF90]';
      case 'completed':
        return 'bg-[#0D47A1] text-[#336699]';
      case 'on-hold':
        return 'bg-[#FFA726] bg-opacity-20 text-[#F9D71C]';
      case 'cancelled':
        return 'bg-[#D32F2F] bg-opacity-20 text-[#D32F2F]';
      default:
        return 'bg-[#333333] text-[#9E9E9E]';
    }
  };

  // Bulk select logic
  const allSelected = projects.length > 0 && selectedRows.length === projects.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedRows([]);
    else setSelectedRows(projects.map(project => project.id));
  };
  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const rowDropdownItems = (project: Project) => [
    {
      label: 'View Details',
      onClick: () => navigate(`/projects/${project.id}`),
      className: 'font-bold text-white',
    },
    {
      label: '',
      onClick: () => {},
      className: 'pointer-events-none border-t border-[#35384A] my-1',
    },
    {
      label: 'Edit Project',
      onClick: () => navigate(`/projects/${project.id}/edit`),
      className: 'font-bold text-white',
    },
    {
      label: '',
      onClick: () => {},
      className: 'pointer-events-none border-t border-[#35384A] my-1',
    },
    {
      label: 'Delete',
      onClick: () => {/* delete logic placeholder */},
      className: 'font-bold text-[#D32F2F]',
    },
  ];

  // Project summary statistics
  const activeProjects = projects.filter(project => project.status === 'active');
  const completedProjects = projects.filter(project => project.status === 'completed');
  const onHoldProjects = projects.filter(project => project.status === 'on-hold');
  
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const activeBudget = activeProjects.reduce((sum, project) => sum + project.budget, 0);

  return (
    <DashboardLayout>
      <PageHeader
        hideTitle={true}
      />
      
      {/* Project summary cards */}
      <div className="hidden md:flex gap-0 mb-6">
        {/* Total Projects */}
        <div className="flex-1 border border-[#35384A] border-r-0 p-4 flex flex-col justify-center min-w-[180px]">
          <span className="text-sm text-gray-400 mb-1 font-['Roboto']">Total Projects</span>
          <span className="text-2xl font-bold text-white font-['Roboto_Condensed']">{projects.length}</span>
          <span className="text-xs text-gray-500 font-['Roboto']">Total Budget: {formatCurrency(totalBudget)}</span>
        </div>
        {/* Active Projects */}
        <div className="flex-1 border border-[#35384A] border-r-0 p-4 flex flex-col justify-center min-w-[180px]">
          <span className="text-sm text-gray-400 mb-1 font-['Roboto']">Active Projects</span>
          <span className="text-2xl font-bold text-[#6BFF90] font-['Roboto_Condensed']">{activeProjects.length}</span>
          <span className="text-xs text-gray-500 font-['Roboto']">Budget: {formatCurrency(activeBudget)}</span>
        </div>
        {/* On Hold */}
        <div className="flex-1 border border-[#35384A] border-r-0 p-4 flex flex-col justify-center min-w-[180px]">
          <span className="text-sm text-gray-400 mb-1 font-['Roboto']">On Hold</span>
          <span className="text-2xl font-bold text-[#F9D71C] font-['Roboto_Condensed']">{onHoldProjects.length}</span>
          <span className="text-xs text-gray-500 font-['Roboto']">{formatCurrency(onHoldProjects.reduce((sum, p) => sum + p.budget, 0))}</span>
        </div>
        {/* Completed */}
        <div className="flex-1 border border-[#35384A] p-4 flex flex-col justify-center min-w-[180px]">
          <span className="text-sm text-gray-400 mb-1 font-['Roboto']">Completed</span>
          <span className="text-2xl font-bold text-[#336699] font-['Roboto_Condensed']">{completedProjects.length}</span>
          <span className="text-xs text-gray-500 font-['Roboto']">{formatCurrency(completedProjects.reduce((sum, p) => sum + p.budget, 0))}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white font-['Roboto_Condensed'] uppercase">Projects</h2>
        <NewButton 
          onClick={() => navigate('/projects/new')} 
          label="New Project"
          color="yellow"
          className="rounded-[4px] font-bold font-['Roboto']"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <div className="bg-[#121212] rounded-[4px] shadow overflow-hidden border border-[#333333]">
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
            <table className="min-w-full bg-[#121212]">
              <thead>
                <tr className="bg-[#1E1E1E] sticky top-0 z-10">
                  <th className="w-12 px-3 py-4 align-middle">
                    <div className="flex items-center h-full">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-[#336699] bg-transparent border-[#555555] rounded-sm focus:ring-[#0D47A1] focus:ring-opacity-40"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">NAME</th>
                  <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">STATUS</th>
                  <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">BUDGET</th>
                  <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">START DATE</th>
                  <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">END DATE</th>
                  <th className="w-8 px-3 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className={`transition-colors ${selectedRows.includes(project.id) ? 'bg-[#1E1E1E]' : 'hover:bg-[#1E1E1E]'} cursor-pointer`}
                    onClick={() => toggleSelectRow(project.id)}
                  >
                    <td className="px-3 py-4 align-middle">
                      <div className="flex items-center h-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-[#336699] bg-transparent border-[#555555] rounded-sm focus:ring-[#0D47A1] focus:ring-opacity-40"
                          checked={selectedRows.includes(project.id)}
                          onChange={() => toggleSelectRow(project.id)}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 font-medium text-white font-['Roboto']">{project.name}</td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center">
                          <span className="w-5 h-5 bg-[#333333] rounded-[4px] flex items-center justify-center mr-2">
                            <span className={`block w-2 h-2 ${getStatusColor(project.status).split(' ')[1]} rounded-[4px]`}></span>
                          </span>
                          <span className="text-white text-sm font-['Roboto'] capitalize">{project.status}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-white font-['Roboto_Mono'] font-medium">{formatCurrency(project.budget)}</td>
                    <td className="px-3 py-4 text-white font-['Roboto']">{new Date(project.start_date).toLocaleDateString()}</td>
                    <td className="px-3 py-4 text-white font-['Roboto']">{new Date(project.end_date).toLocaleDateString()}</td>
                    <td className="px-3 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Dropdown
                        trigger={
                          <button className="text-[#9E9E9E] hover:text-[#F9D71C]">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        }
                        items={rowDropdownItems(project)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProjectList;
