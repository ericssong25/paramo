import React from 'react';
import { X, Folder, User, Plus } from 'lucide-react';
import { Project } from '../types';

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string | null) => void;
  projects: Project[];
}

const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  projects,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Seleccionar Proyecto
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Selecciona un proyecto para la nueva tarea o crea una tarea sin proyecto.
            </p>

            {/* Proyectos */}
            <div className="space-y-2 mb-4">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{project.name}</div>
                      {project.client && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {project.client}
                        </div>
                      )}
                    </div>
                  </div>
                  <Folder className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Botón para crear sin proyecto */}
            <button
              onClick={() => onSelectProject(null)}
              className="w-full flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear tarea sin proyecto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectionModal;
