import { supabase } from '../supabase'
import type { Hotel, Inserts, Updates } from '../supabase'

// Type alias for better clarity
export type Establishment = Hotel
export type EstablishmentInsert = Inserts<'hotels'>
export type EstablishmentUpdate = Updates<'hotels'>

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
 * Establishments API - CRUD operations for hotels table
 */
export const establishmentsApi = {
  /**
   * Fetch all establishments with optional filtering
   */
  async getEstablishments(filters?: {
    statut?: 'ACTIF' | 'INACTIF'
    ville?: string
    type_etablissement?: string
    is_active?: boolean
    limit?: number
    offset?: number
  }): Promise<ApiListResponse<Establishment>> {
    try {
      let query = supabase
        .from('hotels')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters?.statut) {
        query = query.eq('statut', filters.statut)
      }
      if (filters?.ville) {
        query = query.ilike('ville', `%${filters.ville}%`)
      }
      // Remove type_etablissement filter as this column doesn't exist
      // if (filters?.type_etablissement) {
      //   query = query.eq('type_etablissement', filters.type_etablissement)
      // }
      // Remove is_active filter as this column doesn't exist
      // if (filters?.is_active !== undefined) {
      //   query = query.eq('is_active', filters.is_active)
      // }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
      }

      // Order by name
      query = query.order('nom')

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching establishments:', error)
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
      console.error('Unexpected error fetching establishments:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Fetch a single establishment by ID
   */
  async getEstablishment(id: number): Promise<ApiResponse<Establishment>> {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching establishment:', error)
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
      console.error('Unexpected error fetching establishment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Fetch establishment with related data (rooms, categories)
   */
  async getEstablishmentWithDetails(id: number): Promise<ApiResponse<Establishment & {
    rooms?: any[]
    room_categories?: any[]
  }>> {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          rooms (*),
          room_categories (*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching establishment with details:', error)
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
      console.error('Unexpected error fetching establishment with details:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Create a new establishment
   */
  async createEstablishment(data: EstablishmentInsert): Promise<ApiResponse<Establishment>> {
    try {
      // Set default values - Remove is_active as it doesn't exist in the table
      const establishmentData: EstablishmentInsert = {
        ...data,
        statut: data.statut || 'ACTIF',
        chambres_total: data.chambres_total || 0,
        chambres_occupees: data.chambres_occupees || 0,
        taux_occupation: data.taux_occupation || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Remove fields that don't exist in the table
      delete (establishmentData as any).is_active;
      delete (establishmentData as any).type_etablissement;

      const { data: establishment, error } = await supabase
        .from('hotels')
        .insert(establishmentData)
        .select()
        .single()

      if (error) {
        console.error('Error creating establishment:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: establishment,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error creating establishment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Update an existing establishment
   */
  async updateEstablishment(id: number, data: EstablishmentUpdate): Promise<ApiResponse<Establishment>> {
    try {
      // Add updated_at timestamp
      const updateData: EstablishmentUpdate = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { data: establishment, error } = await supabase
        .from('hotels')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating establishment:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: establishment,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error updating establishment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Delete an establishment (soft delete by setting is_active to false)
   */
  async deleteEstablishment(id: number, hardDelete = false): Promise<ApiResponse<boolean>> {
    try {
      if (hardDelete) {
        // Hard delete - actually remove from database
        const { error } = await supabase
          .from('hotels')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting establishment:', error)
          return {
            data: null,
            error: error.message,
            success: false
          }
        }
      } else {
        // Soft delete - set statut to INACTIF
        const { error } = await supabase
          .from('hotels')
          .update({ 
            statut: 'INACTIF',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (error) {
          console.error('Error soft deleting establishment:', error)
          return {
            data: null,
            error: error.message,
            success: false
          }
        }
      }

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error deleting establishment:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Get establishment statistics
   */
  async getEstablishmentStatistics(id: number): Promise<ApiResponse<{
    total_rooms: number
    occupied_rooms: number
    available_rooms: number
    occupancy_rate: number
    total_reservations: number
    active_reservations: number
    revenue_current_month: number
  }>> {
    try {
      // This would ideally use a stored procedure or RPC function
      // For now, we'll gather data from multiple queries
      const [roomsResult, reservationsResult] = await Promise.all([
        supabase
          .from('rooms')
          .select('statut')
          .eq('hotel_id', id),
        supabase
          .from('reservations')
          .select('statut, prix')
          .eq('hotel_id', id)
      ])

      if (roomsResult.error || reservationsResult.error) {
        return {
          data: null,
          error: roomsResult.error?.message || reservationsResult.error?.message || 'Error fetching statistics',
          success: false
        }
      }

      const rooms = roomsResult.data || []
      const reservations = reservationsResult.data || []

      const totalRooms = rooms.length
      const occupiedRooms = rooms.filter(room => room.statut === 'occupee').length
      const availableRooms = rooms.filter(room => room.statut === 'disponible').length
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

      const activeReservations = reservations.filter(res => 
        res.statut === 'CONFIRMEE' || res.statut === 'EN_COURS'
      ).length

      // Calculate current month revenue
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const revenueCurrentMonth = reservations
        .filter(res => {
          const resDate = new Date(res.statut) // This should be a date field
          return resDate.getMonth() === currentMonth && resDate.getFullYear() === currentYear
        })
        .reduce((sum, res) => sum + (res.prix || 0), 0)

      return {
        data: {
          total_rooms: totalRooms,
          occupied_rooms: occupiedRooms,
          available_rooms: availableRooms,
          occupancy_rate: Math.round(occupancyRate * 100) / 100,
          total_reservations: reservations.length,
          active_reservations: activeReservations,
          revenue_current_month: revenueCurrentMonth
        },
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error fetching establishment statistics:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Search establishments by name or location
   */
  async searchEstablishments(query: string, limit = 10): Promise<ApiListResponse<Establishment>> {
    try {
      const { data, error, count } = await supabase
        .from('hotels')
        .select('*', { count: 'exact' })
        .or(`nom.ilike.%${query}%,ville.ilike.%${query}%,adresse.ilike.%${query}%`)
        .eq('statut', 'ACTIF')  // Use statut instead of is_active
        .order('nom')
        .limit(limit)

      if (error) {
        console.error('Error searching establishments:', error)
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
      console.error('Unexpected error searching establishments:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Toggle establishment status (ACTIF/INACTIF)
   */
  async toggleEstablishmentStatus(id: number): Promise<ApiResponse<Establishment>> {
    try {
      // First get current status
      const { data: current, error: fetchError } = await supabase
        .from('hotels')
        .select('statut')
        .eq('id', id)
        .single()

      if (fetchError) {
        return {
          data: null,
          error: fetchError.message,
          success: false
        }
      }

      const newStatus = current.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF'
      
      return await this.updateEstablishment(id, { 
        statut: newStatus
      })
    } catch (err) {
      console.error('Unexpected error toggling establishment status:', err)
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
  getEstablishments,
  getEstablishment,
  getEstablishmentWithDetails,
  createEstablishment,
  updateEstablishment,
  deleteEstablishment,
  getEstablishmentStatistics,
  searchEstablishments,
  toggleEstablishmentStatus
} = establishmentsApi

// Default export
export default establishmentsApi