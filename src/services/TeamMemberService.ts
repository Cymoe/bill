import { supabase } from '../lib/supabase';

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  job_title: string;
  department: string;
  hire_date?: string;
  salary?: number;
  hourly_rate?: number;
  employment_type: 'full-time' | 'part-time' | 'contractor';
  status: 'active' | 'inactive' | 'on-leave';
  permissions: string[];
  manager_id?: string;
  emergency_contact?: string;
  address?: string;
  user_id?: string;
  organization_id: string;
  created_at: string;
  updated_at?: string;
  // Calculated fields
  projectsAssigned?: number;
  hoursThisMonth?: number;
  lastActivity?: string;
}

export interface CreateTeamMemberData {
  name: string;
  email?: string;
  phone?: string;
  job_title: string;
  department: string;
  hire_date?: string;
  salary?: number;
  hourly_rate?: number;
  employment_type: 'full-time' | 'part-time' | 'contractor';
  status: 'active' | 'inactive' | 'on-leave';
  permissions?: string[];
  manager_id?: string;
  emergency_contact?: string;
  address?: string;
  user_id?: string;
  organization_id: string;
}

export const DEPARTMENTS = [
  'Management',
  'Field Operations', 
  'Sales',
  'Project Management',
  'Administration',
  'Accounting',
  'Safety',
  'Quality Control',
  'Equipment',
  'Logistics'
];

export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contractor', label: 'Contractor' }
];

export class TeamMemberService {
  static async getTeamMembers(organizationId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }

    // Add calculated fields for projects and hours
    const enrichedMembers = (data || []).map(member => ({
      ...member,
      projectsAssigned: Math.floor(Math.random() * 6) + 1, // Mock for now
      hoursThisMonth: Math.floor(Math.random() * 40) + 140, // Mock for now
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));

    return enrichedMembers;
  }

  static async createTeamMember(teamMemberData: CreateTeamMemberData): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert([teamMemberData])
      .select()
      .single();

    if (error) {
      console.error('Error creating team member:', error);
      throw error;
    }

    return data;
  }

  static async updateTeamMember(id: string, updates: Partial<CreateTeamMemberData>): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member:', error);
      throw error;
    }

    return data;
  }

  static async deleteTeamMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  }

  static async getTeamMemberById(id: string): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching team member:', error);
      throw error;
    }

    return data;
  }
} 