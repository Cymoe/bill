import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { DashboardLayout } from '../layouts/DashboardLayout';

type Project = Tables['projects'];
type Bill = Tables['bills'];

export const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<Project | null>(null);
  const [bills, setBills] = React.useState<Bill[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch project details
        const projectData = await db.projects.getById(id);
        setProject(projectData);

        // Fetch associated bills
        const projectBills = await db.projects.getProjectBills(id);
        setBills(projectBills);
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF3B30]"></div>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-medium text-white">{project.name}</h1>
          <div className="space-x-3">
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center h-10 px-4 rounded-md text-sm font-medium text-white bg-[#1e2532] hover:bg-[#2a3441] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Projects
            </button>
            <button
              onClick={() => navigate(`/projects/${project.id}/edit`)}
              className="inline-flex items-center h-10 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Project
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#1e2532] rounded-lg px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-400">Budget</dt>
            <dd className="mt-1 text-2xl font-medium text-white">${project.budget.toLocaleString()}</dd>
          </div>

          <div className="bg-[#1e2532] rounded-lg px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-400">Status</dt>
            <dd className="mt-1 text-2xl font-medium text-indigo-400">{project.status}</dd>
          </div>

          <div className="bg-[#1e2532] rounded-lg px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-400">Start Date</dt>
            <dd className="mt-1 text-2xl font-medium text-white">{new Date(project.start_date).toLocaleDateString()}</dd>
          </div>

          <div className="bg-[#1e2532] rounded-lg px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-400">End Date</dt>
            <dd className="mt-1 text-2xl font-medium text-white">{new Date(project.end_date).toLocaleDateString()}</dd>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-white">Associated Bills</h2>
          <div className="mt-4 bg-[#1e2532] rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              {bills.length === 0 ? (
                <p className="text-gray-400">No bills associated with this project yet.</p>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {bills.map((bill) => (
                    <li key={bill.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{bill.description}</p>
                          <p className="text-sm text-gray-400">
                            Due: {new Date(bill.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-[#2a3441] text-indigo-400">
                            ${bill.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-4 px-4 py-3 bg-white bg-opacity-8 sm:px-6">
              <button
                onClick={() => navigate('/bills/new', { state: { projectId: id } })}
                className="inline-flex items-center h-12 px-6 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#FF3B30] hover:bg-opacity-64 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:ring-offset-2 transition-colors duration-200"
              >
                Add New Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetails;
