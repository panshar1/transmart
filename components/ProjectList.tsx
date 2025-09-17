import React, { useState, useMemo } from 'react';
import type { Project } from '../types';
import { ProjectIcon, PlusIcon, TrashIcon, SearchIcon, EyeIcon } from './Icons';
import Modal from './Modal';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onAddProject: (name: string, description: string, productGroup: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, onAddProject, onDeleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectGroup, setProjectGroup] = useState('');
  const [newProjectGroup, setNewProjectGroup] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const productGroups = useMemo(() => {
    const groups = new Set(projects.map(p => p.productGroup).filter(Boolean));
    return Array.from(groups).sort();
  }, [projects]);
  
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const lowercasedQuery = searchQuery.toLowerCase();
    return projects.filter(p => 
      p.name.toLowerCase().includes(lowercasedQuery) ||
      p.productGroup.toLowerCase().includes(lowercasedQuery)
    );
  }, [projects, searchQuery]);

  const handleAddProject = () => {
    const finalGroup = (projectGroup === 'new' ? newProjectGroup.trim() : projectGroup) || 'Uncategorized';
    if (projectName.trim() && finalGroup) {
      onAddProject(projectName.trim(), projectDesc.trim(), finalGroup);
      setProjectName('');
      setProjectDesc('');
      setNewProjectGroup('');
      setProjectGroup(productGroups.length > 0 ? productGroups[0] : 'new');
      setIsModalOpen(false);
    }
  };
  
  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this project and all its data?')) {
        onDeleteProject(projectId);
    }
  }

  return (
    <div className="p-8">
      <div className="bg-white border border-border-color rounded-lg shadow-sm">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-primary">All Projects</h1>
              <p className="text-sm text-gray-500">Showing {filteredProjects.length} of {projects.length} projects</p>
            </div>
            <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
            <PlusIcon className="w-5 h-5" />
            Create New Project
            </button>
        </div>
        
        <div className="p-4">
            <div className="relative w-full md:w-1/3 mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 text-gray-800 p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Search projects"
                />
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-header-bg">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Group</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Languages</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Terms</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-color">
                  {filteredProjects.length > 0 ? filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{project.name}</div>
                        <div className="text-xs text-gray-500">{project.description}</div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{project.productGroup}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{project.targetLanguages.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{project.terms.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(project.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => onSelectProject(project.id)} className="text-accent hover:text-accent-hover p-2 rounded-md hover:bg-blue-50 transition-colors" title="View Project">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button onClick={(e) => handleDelete(e, project.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors" title="Delete Project">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-gray-500">
                        <ProjectIcon className="w-16 h-16 mx-auto mb-4 text-gray-300"/>
                        <h2 className="text-2xl font-semibold mb-2">No Projects Found</h2>
                        <p>{searchQuery ? 'Try adjusting your search query.' : 'Click "Create New Project" to get started.'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <div className="space-y-4">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
            placeholder="Project Description (Optional)"
            className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
          />
           <div>
              <label htmlFor="project-group" className="block text-sm font-medium text-gray-700 mb-1">Product Group</label>
              <select
                id="project-group"
                value={projectGroup}
                onChange={(e) => setProjectGroup(e.target.value)}
                className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {productGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
                <option value="new">-- Add New Group --</option>
              </select>
            </div>

            {projectGroup === 'new' && (
              <div>
                  <label htmlFor="new-project-group" className="sr-only">New Product Group Name</label>
                  <input
                    id="new-project-group"
                    type="text"
                    value={newProjectGroup}
                    onChange={(e) => setNewProjectGroup(e.target.value)}
                    placeholder="New Product Group Name"
                    className="w-full bg-gray-100 text-gray-800 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
              </div>
            )}
          <button
            onClick={handleAddProject}
            className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Create Project
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;
