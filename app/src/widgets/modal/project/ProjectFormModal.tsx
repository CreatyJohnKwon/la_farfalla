"use client";

import { IProject } from "@/src/entities/type/project";
import ProjectForm from "./ProjectForm";
import ModalWrap from "../etc/ModalWrap";

interface ProjectFormModalProps {
    project?: IProject;
    onClose: () => void;
}

const ProjectFormModal = ({ project, onClose }: ProjectFormModalProps) => {
    const isUpdateMode = !!project;

    return (
        <ModalWrap
            onClose={onClose}
            className="relative flex max-h-[90vh] h-auto w-full max-w-2xl flex-col rounded-sm bg-white"
        >
            <header className="flex items-center justify-between border-b p-6">
                <h2 className="text-xl font-bold text-gray-800">
                    {isUpdateMode ? '프로젝트 수정' : '새 프로젝트 생성'}
                </h2>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </header>
            
            <ProjectForm 
                project={project} 
                onClose={onClose} 
            />
        </ModalWrap>
    );
};

export default ProjectFormModal;