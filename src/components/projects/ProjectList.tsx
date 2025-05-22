import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeader } from '../common/PageHeader';
import { NewButton } from '../common/NewButton';

type Project = Tables['projects'];

interface PlusIconProps {
  className?: string;
}

// Simple Plus Icon component since we can't use @heroicons yet
const PlusIcon: React.FC<PlusIconProps> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  // Search functionality removed with duplicate header

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
        return 'bg-[#6BFF90] bg-opacity-8 text-[#6BFF90]';
      case 'completed':
        return 'bg-[#FF3B30] bg-opacity-8 text-[#FF3B30]';
      case 'on-hold':
        return 'bg-[#FFA726] bg-opacity-8 text-[#FFA726]';
      case 'cancelled':
        return 'bg-[#F41857] bg-opacity-8 text-[#F41857]';
      default:
        return 'bg-white bg-opacity-8 text-white';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF3B30]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-0">
        <PageHeader
          hideTitle={true}
        />
        <div className="mt-8 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow rounded-lg bg-[#1e2532]">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#2a3441]">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-400">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-400">
                      Budget
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-400">
                      Start Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-400">
                      End Date
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-transparent">
                  {projects.map((project) => (
                    <tr key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer hover:bg-[#2a3441] transition-colors duration-200">
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                        {project.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                        ${project.budget.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                        {new Date(project.start_date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                        {new Date(project.end_date).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}/edit`);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectList;
