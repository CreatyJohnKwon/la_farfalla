import { Document } from 'mongoose';
import { IDescriptionItem } from './products';

interface IProjectBase {
  title: string;
  image: string;
  description: IDescriptionItem[];
}

interface IProject extends IProjectBase, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type {
    IProjectBase,
    IProject,
}