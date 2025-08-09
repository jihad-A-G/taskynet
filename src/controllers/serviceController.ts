import { Request, Response } from 'express';
import { Service } from '../models';

export const createService = async (req: Request, res: Response) => {
  try {
    const service = new Service(req.body);
    const savedService = await service.save();
    return res.status(201).json(savedService);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find();
    return res.json(services);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json(service);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json(service);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
