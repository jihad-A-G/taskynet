import { Request, Response } from 'express';
import { Role } from '../models';

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = new Role(req.body);
    const savedRole = await role.save();
    return res.status(201).json(savedRole);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find();
    return res.json(roles);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    return res.json(role);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    return res.json(role);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    return res.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
