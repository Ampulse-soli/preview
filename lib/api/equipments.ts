import { supabase } from '../supabase'
import type { Tables, Inserts, Updates } from '../supabase'

// Type aliases for better clarity
export type Equipment = Tables<'equipments'>
export type EquipmentInsert = Inserts<'equipments'>
export type EquipmentUpdate = Updates<'equipments'>
export type HotelEquipment = Tables<'hotel_equipments'>
export type HotelEquipmentInsert = Inserts<'hotel_equipments'>
export type HotelEquipmentUpdate = Updates<'hotel_equipments'>

// Extended type for equipment with hotel association details
export interface EquipmentWithHotelDetails extends Equipment {
  hotel_equipment?: HotelEquipment
  hotels_count?: number
}

// Response types for consistent API responses
interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

interface ApiListResponse<T> {
  data: T[] | null
  error: string | null
  success: boolean
  count?: number
}

/**
 * Equipments API - CRUD operations for equipment management
 */
export const equipmentsApi = {
  /**
   * Get all equipments with optional filters
   */
  async getEquipments(filters?: {
    type?: string
    category?: string
    is_active?: boolean
    limit?: number
    offset?: number
  }): Promise<ApiListResponse<Equipment>> {
    try {
      let query = supabase
        .from('equipments')
        .select('*', { count: 'exact' })
        
      // Apply filters
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      
      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
      }
      
      // Order by display order and name
      query = query.order('display_order', { ascending: true })
        .order('name', { ascending: true })

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching equipments:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: data || [],
        error: null,
        success: true,
        count: count || 0
      }
    } catch (err) {
      console.error('Unexpected error fetching equipments:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Get equipments associated with a specific hotel
   */
  async getEquipmentsByHotel(hotelId: number, filters?: {
    is_available?: boolean
    condition?: string
  }): Promise<ApiListResponse<EquipmentWithHotelDetails>> {
    try {
      let query = supabase
        .from('hotel_equipments')
        .select(`
          *,
          equipment:equipments(*)
        `, { count: 'exact' })
        .eq('hotel_id', hotelId)
      
      // Apply filters
      if (filters?.is_available !== undefined) {
        query = query.eq('is_available', filters.is_available)
      }
      if (filters?.condition) {
        query = query.eq('condition', filters.condition)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching hotel equipments:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      // Transform data to include hotel_equipment details
      const transformedData = (data || []).map((item: any) => ({
        ...item.equipment,
        hotel_equipment: {
          id: item.id,
          hotel_id: item.hotel_id,
          equipment_id: item.equipment_id,
          is_available: item.is_available,
          quantity: item.quantity,
          condition: item.condition,
          location: item.location,
          notes: item.notes,
          price_per_use: item.price_per_use,
          last_maintenance: item.last_maintenance,
          next_maintenance: item.next_maintenance,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      }))

      return {
        data: transformedData,
        error: null,
        success: true,
        count: count || 0
      }
    } catch (err) {
      console.error('Unexpected error fetching hotel equipments:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Get a single equipment by ID
   */
  async getEquipment(id: number): Promise<ApiResponse<Equipment>> {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching equipment:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error fetching equipment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Create a new equipment
   */
  async createEquipment(data: EquipmentInsert): Promise<ApiResponse<Equipment>> {
    try {
      const equipmentData: EquipmentInsert = {
        ...data,
        est_actif: data.est_actif ?? true,
        ordre_affichage: data.ordre_affichage ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: equipment, error } = await supabase
        .from('equipments')
        .insert(equipmentData)
        .select()
        .single()

      if (error) {
        console.error('Error creating equipment:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: equipment,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error creating equipment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Update an existing equipment
   */
  async updateEquipment(id: number, data: EquipmentUpdate): Promise<ApiResponse<Equipment>> {
    try {
      const updateData: EquipmentUpdate = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { data: equipment, error } = await supabase
        .from('equipments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating equipment:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: equipment,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error updating equipment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Delete an equipment
   */
  async deleteEquipment(id: number): Promise<ApiResponse<boolean>> {
    try {
      // Check if equipment is associated with any hotels
      const { data: associations, error: checkError } = await supabase
        .from('hotel_equipments')
        .select('id')
        .eq('equipment_id', id)
        .limit(1)

      if (checkError) {
        console.error('Error checking equipment associations:', checkError)
        // Continue with deletion if we can't check
      } else if (associations && associations.length > 0) {
        return {
          data: null,
          error: 'Cannot delete equipment that is associated with hotels. Remove associations first.',
          success: false
        }
      }

      const { error } = await supabase
        .from('equipments')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting equipment:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error deleting equipment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Add equipment to a hotel
   */
  async addEquipmentToHotel(
    hotelId: number, 
    equipmentId: number, 
    options?: {
      est_gratuit?: boolean
      prix_supplement?: number
      description_specifique?: string
      horaires_disponibilite?: Record<string, unknown>
      conditions_usage?: string
      notes_internes?: string
    }
  ): Promise<ApiResponse<HotelEquipment>> {
    try {
      const hotelEquipmentData: HotelEquipmentInsert = {
        hotel_id: hotelId,
        equipment_id: equipmentId,
        est_disponible: true,
        est_gratuit: options?.est_gratuit ?? true,
        prix_supplement: options?.prix_supplement ?? null,
        description_specifique: options?.description_specifique,
        horaires_disponibilite: options?.horaires_disponibilite,
        conditions_usage: options?.conditions_usage,
        notes_internes: options?.notes_internes,
        date_ajout: new Date().toISOString(),
        date_derniere_maj: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('hotel_equipments')
        .insert(hotelEquipmentData)
        .select()
        .single()

      if (error) {
        console.error('Error adding equipment to hotel:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error adding equipment to hotel:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Remove equipment from a hotel
   */
  async removeEquipmentFromHotel(hotelId: number, equipmentId: number): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('hotel_equipments')
        .delete()
        .eq('hotel_id', hotelId)
        .eq('equipment_id', equipmentId)

      if (error) {
        console.error('Error removing equipment from hotel:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error removing equipment from hotel:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Update hotel equipment details
   */
  async updateHotelEquipment(
    hotelId: number, 
    equipmentId: number, 
    data: Partial<HotelEquipmentUpdate>
  ): Promise<ApiResponse<HotelEquipment>> {
    try {
      const updateData: HotelEquipmentUpdate = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { data: hotelEquipment, error } = await supabase
        .from('hotel_equipments')
        .update(updateData)
        .eq('hotel_id', hotelId)
        .eq('equipment_id', equipmentId)
        .select()
        .single()

      if (error) {
        console.error('Error updating hotel equipment:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: hotelEquipment,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error updating hotel equipment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Search equipments by name or description
   */
  async searchEquipments(query: string, limit = 10): Promise<ApiListResponse<Equipment>> {
    try {
      const { data, error, count } = await supabase
        .from('equipments')
        .select('*', { count: 'exact' })
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error searching equipments:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: data || [],
        error: null,
        success: true,
        count: count || 0
      }
    } catch (err) {
      console.error('Unexpected error searching equipments:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Get equipment statistics for a hotel
   */
  async getHotelEquipmentStatistics(hotelId: number): Promise<ApiResponse<{
    total_equipments: number
    available_equipments: number
    unavailable_equipments: number
    maintenance_due: number
    by_condition: Record<string, number>
    by_category: Record<string, number>
    total_value: number
  }>> {
    try {
      const { data, error } = await supabase
        .from('hotel_equipments')
        .select(`
          *,
          equipment:equipments(*)
        `)
        .eq('hotel_id', hotelId)

      if (error) {
        console.error('Error fetching hotel equipment statistics:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      if (!data || data.length === 0) {
        return {
          data: {
            total_equipments: 0,
            available_equipments: 0,
            unavailable_equipments: 0,
            maintenance_due: 0,
            by_condition: {},
            by_category: {},
            total_value: 0
          },
          error: null,
          success: true
        }
      }

      const totalEquipments = data.length
      const availableEquipments = data.filter(e => e.is_available).length
      const unavailableEquipments = totalEquipments - availableEquipments
      
      // Check maintenance due (next_maintenance in the past or within 7 days)
      const now = new Date()
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const maintenanceDue = data.filter(e => 
        e.next_maintenance && new Date(e.next_maintenance) <= oneWeekFromNow
      ).length

      const byCondition: Record<string, number> = {}
      const byCategory: Record<string, number> = {}
      let totalValue = 0

      data.forEach((item: any) => {
        // Count by condition
        if (item.condition) {
          byCondition[item.condition] = (byCondition[item.condition] || 0) + 1
        }

        // Count by category
        if (item.equipment?.category) {
          byCategory[item.equipment.category] = (byCategory[item.equipment.category] || 0) + 1
        }

        // Calculate total value
        totalValue += (Number(item.price_per_use) || 0) * (item.quantity || 1)
      })

      return {
        data: {
          total_equipments: totalEquipments,
          available_equipments: availableEquipments,
          unavailable_equipments: unavailableEquipments,
          maintenance_due: maintenanceDue,
          by_condition: byCondition,
          by_category: byCategory,
          total_value: Math.round(totalValue * 100) / 100
        },
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error fetching hotel equipment statistics:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  }
}

// Export individual functions for convenience
export const {
  getEquipments,
  getEquipmentsByHotel,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  addEquipmentToHotel,
  removeEquipmentFromHotel,
  updateHotelEquipment,
  searchEquipments,
  getHotelEquipmentStatistics
} = equipmentsApi

// Default export
export default equipmentsApi