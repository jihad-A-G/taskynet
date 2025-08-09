import { Request, Response } from 'express';
import { Zone } from '../models';

export const createZone = async (req: Request, res: Response) => {
  try {
    const zone = new Zone(req.body);
    const savedZone = await zone.save();
    return res.status(201).json(savedZone);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllZones = async (req: Request, res: Response) => {
  try {
    const zones = await Zone.find();
    return res.json(zones);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getZoneById = async (req: Request, res: Response) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    return res.json(zone);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateZone = async (req: Request, res: Response) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    return res.json(zone);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteZone = async (req: Request, res: Response) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    return res.json({ message: 'Zone deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
