"use client";

import { motion } from "framer-motion";
import { IProject } from "@/src/entities/type/project";
import ProjectForm from "./ProjectForm";
import { useProjectListQuery } from "@/src/shared/hooks/react-query/useProjectQuery";

interface ProjectFormModalProps {
    project?: IProject;
    onClose: () => void;
}

const ProjectFormModal = ({ project, onClose }: ProjectFormModalProps) => {
    const isUpdateMode = !!project;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.2 }}
                className="relative flex max-h-[90vh] h-auto w-full max-w-2xl flex-col rounded-sm bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b p-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isUpdateMode ? '프로젝트 수정' : '새 프로젝트 생성'}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">&times;</button>
                </header>
                
                <ProjectForm 
                    project={project} 
                    onClose={onClose} 
                />
            </motion.div>
        </div>
    );
};

export default ProjectFormModal;