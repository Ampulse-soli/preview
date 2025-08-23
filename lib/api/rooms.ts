import { supabase } from '../supabase'
import type { Tables, Inserts, Updates } from '../supabase'

// Type alias for better clarity
export type Room = Tables<'rooms'>
export type RoomInsert = Inserts<'rooms'>
export type RoomUpdate = Updates<'rooms'>

// Utility function to normalize room data for frontend consumption
const normalizeRoomData = (room: Room): Room => {
  return {
    ...room,
    // Ensure images is always an array
    images: room.images || [],
    // Ensure amenities is always an array
    amenities: room.amenities || [],
    // Provide default values for optional fields
    floor: room.floor ?? 0,
    is_smoking: room.is_smoking ?? false,
    description: room.description || '',
    notes: room.notes || ''
  }
}

// Utility function to prepare data for database insertion/update
const prepareRoomData = (data: any): any => {
  return {
    ...data,
    // Convert string arrays to appropriate format for database
    images: data.images ? (Array.isArray(data.images) ? data.images.map((img: any) => 
      typeof img === 'string' ? { url: img } : img
    ) : []) : [],
    amenities: data.amenities ? (Array.isArray(data.amenities) ? data.amenities.map((amenity: any) => 
      typeof amenity === 'string' ? { name: amenity } : amenity
    ) : []) : [],
  }
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
 * Rooms API - CRUD operations for rooms table
 */
export const roomsApi = {
  /**
   * Fetch all rooms for a specific hotel
   * Alias for getRoomsByHotel for consistency
   */
  async getRoomsByHotel(hotelId: number, filters?: {
    statut?: 'disponible' | 'occupee' | 'maintenance'
    type?: string
    floor?: number
    bed_type?: string
    view_type?: string
    is_smoking?: boolean
    limit?: number
    offset?: number
  }): Promise<ApiListResponse<Room>> {
    return this.getRooms(hotelId, filters)
  },

  /**
   * Fetch all rooms for a specific hotel or all hotels
   */
  async getRooms(hotelId?: number, filters?: {
    statut?: 'disponible' | 'occupee' | 'maintenance'
    type?: string
    floor?: number
    bed_type?: string
    view_type?: string
    is_smoking?: boolean
    limit?: number
    offset?: number
  }): Promise<ApiListResponse<Room>> {
    try {
      let query = supabase
        .from('rooms')
        .select('*', { count: 'exact' })
      
      // Filter by hotel if specified
      if (hotelId) {
        query = query.eq('hotel_id', hotelId)
      }

      // Apply filters
      if (filters?.statut) {
        query = query.eq('statut', filters.statut)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.floor !== undefined) {
        query = query.eq('floor', filters.floor)
      }
      if (filters?.bed_type) {
        query = query.eq('bed_type', filters.bed_type)
      }
      if (filters?.view_type) {
        query = query.eq('view_type', filters.view_type)
      }
      if (filters?.is_smoking !== undefined) {
        query = query.eq('is_smoking', filters.is_smoking)
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
      }

      // Order by room number
      query = query.order('numero')

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching rooms:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      // Normalize room data for frontend consumption
      const normalizedData = (data || []).map(normalizeRoomData)
      
      return {
        data: normalizedData,
        error: null,
        success: true,
        count: count || 0
      }
    } catch (err) {
      console.error('Unexpected error fetching rooms:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Fetch rooms by category/type for a specific hotel
   */
  async getRoomsByCategory(hotelId: number, category: string): Promise<ApiListResponse<Room>> {
    try {
      const { data, error, count } = await supabase
        .from('rooms')
        .select('*', { count: 'exact' })
        .eq('hotel_id', hotelId)
        .eq('type', category)
        .order('numero')

      if (error) {
        console.error('Error fetching rooms by category:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      // Normalize room data for frontend consumption
      const normalizedData = (data || []).map(normalizeRoomData)
      
      return {
        data: normalizedData,
        error: null,
        success: true,
        count: count || 0
      }
    } catch (err) {
      console.error('Unexpected error fetching rooms by category:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Fetch a single room by ID
   * Alias: getRoomById for consistency
   */
  async getRoomById(id: number): Promise<ApiResponse<Room>> {
    return this.getRoom(id)
  },

  /**
   * Fetch a single room by ID
   */
  async getRoom(id: number): Promise<ApiResponse<Room>> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching room:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: normalizeRoomData(data),
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error fetching room:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Create a new room
   */
  async createRoom(data: RoomInsert): Promise<ApiResponse<Room>> {
    try {
      // Prepare and set default values
      const preparedData = prepareRoomData(data)
      const roomData: RoomInsert = {
        ...preparedData,
        statut: preparedData.statut || 'disponible',
        is_smoking: preparedData.is_smoking || false,
        images: preparedData.images || [],
        amenities: preparedData.amenities || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: room, error } = await supabase
        .from('rooms')
        .insert(roomData)
        .select()
        .single()

      if (error) {
        console.error('Error creating room:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: normalizeRoomData(room),
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error creating room:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Update an existing room
   */
  async updateRoom(id: number, data: RoomUpdate): Promise<ApiResponse<Room>> {
    try {
      // Prepare data and add updated_at timestamp
      const preparedData = prepareRoomData(data)
      const updateData: RoomUpdate = {
        ...preparedData,
        updated_at: new Date().toISOString()
      }

      const { data: room, error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating room:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: normalizeRoomData(room),
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error updating room:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Delete a room
   */
  async deleteRoom(id: number): Promise<ApiResponse<boolean>> {
    try {
      // Check if there are active reservations for this room
      const { data: reservations, error: checkError } = await supabase
        .from('reservations')
        .select('id')
        .eq('room_id', id)
        .in('statut', ['CONFIRMEE', 'EN_COURS'])
        .limit(1)

      if (checkError) {
        console.error('Error checking reservations:', checkError)
        // Continue with deletion if we can't check
      } else if (reservations && reservations.length > 0) {
        return {
          data: null,
          error: 'Cannot delete room with active reservations',
          success: false
        }
      }

      // Proceed with deletion
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting room:', error)
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
      console.error('Unexpected error deleting room:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Get room statistics for a hotel
   */
  async getRoomStatistics(hotelId: number): Promise<ApiResponse<{
    total_rooms: number
    available_rooms: number
    occupied_rooms: number
    maintenance_rooms: number
    occupancy_rate: number
    average_price: number
    rooms_by_type: Record<string, number>
    rooms_by_floor: Record<string, number>
    potential_revenue: number
  }>> {
    try {
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotelId)

      if (error) {
        console.error('Error fetching room statistics:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      if (!rooms || rooms.length === 0) {
        return {
          data: {
            total_rooms: 0,
            available_rooms: 0,
            occupied_rooms: 0,
            maintenance_rooms: 0,
            occupancy_rate: 0,
            average_price: 0,
            rooms_by_type: {},
            rooms_by_floor: {},
            potential_revenue: 0
          },
          error: null,
          success: true
        }
      }

      const totalRooms = rooms.length
      const availableRooms = rooms.filter(r => r.statut === 'disponible').length
      const occupiedRooms = rooms.filter(r => r.statut === 'occupee').length
      const maintenanceRooms = rooms.filter(r => r.statut === 'maintenance').length
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

      const totalPrice = rooms.reduce((sum, r) => sum + (Number(r.prix) || 0), 0)
      const averagePrice = totalRooms > 0 ? totalPrice / totalRooms : 0

      const roomsByType: Record<string, number> = {}
      const roomsByFloor: Record<string, number> = {}

      rooms.forEach(room => {
        // Count by type
        if (room.type) {
          roomsByType[room.type] = (roomsByType[room.type] || 0) + 1
        }

        // Count by floor
        const floor = room.floor !== null && room.floor !== undefined ? room.floor.toString() : 'RDC'
        roomsByFloor[floor] = (roomsByFloor[floor] || 0) + 1
      })

      const potentialRevenue = rooms
        .filter(r => r.statut === 'disponible')
        .reduce((sum, r) => sum + (Number(r.prix) || 0), 0)

      return {
        data: {
          total_rooms: totalRooms,
          available_rooms: availableRooms,
          occupied_rooms: occupiedRooms,
          maintenance_rooms: maintenanceRooms,
          occupancy_rate: Math.round(occupancyRate * 100) / 100,
          average_price: Math.round(averagePrice * 100) / 100,
          rooms_by_type: roomsByType,
          rooms_by_floor: roomsByFloor,
          potential_revenue: Math.round(potentialRevenue * 100) / 100
        },
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error fetching room statistics:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Search rooms by number or description
   */
  async searchRooms(hotelId: number, query: string, limit = 10): Promise<ApiListResponse<Room>> {
    try {
      const { data, error, count } = await supabase
        .from('rooms')
        .select('*', { count: 'exact' })
        .eq('hotel_id', hotelId)
        .or(`numero.ilike.%${query}%,type.ilike.%${query}%,description.ilike.%${query}%`)
        .order('numero')
        .limit(limit)

      if (error) {
        console.error('Error searching rooms:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      // Normalize room data for frontend consumption
      const normalizedData = (data || []).map(normalizeRoomData)
      
      return {
        data: normalizedData,
        error: null,
        success: true,
        count: count || 0
      }
    } catch (err) {
      console.error('Unexpected error searching rooms:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Update room status quickly
   */
  async updateRoomStatus(id: number, status: 'disponible' | 'occupee' | 'maintenance'): Promise<ApiResponse<Room>> {
    try {
      const updateData: RoomUpdate = {
        statut: status,
        updated_at: new Date().toISOString()
      }

      // If room becomes available, update last_cleaned
      if (status === 'disponible') {
        updateData.last_cleaned = new Date().toISOString()
      }

      const { data: room, error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating room status:', error)
        return {
          data: null,
          error: error.message,
          success: false
        }
      }

      return {
        data: normalizeRoomData(room),
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error updating room status:', err)
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Check room availability for specific dates
   * Returns whether a room is available for the given date range
   */
  async checkRoomAvailability(
    roomId: number,
    dates: {
      dateArrivee: string
      dateDepart: string
    }
  ): Promise<ApiResponse<{
    available: boolean
    conflictingReservations?: any[]
    reason?: string
  }>> {
    try {
      // First check if room exists and is not in maintenance
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, statut, hotel_id')
        .eq('id', roomId)
        .single()

      if (roomError || !room) {
        return {
          data: {
            available: false,
            reason: 'Room not found'
          },
          error: roomError?.message || 'Room not found',
          success: false
        }
      }

      if (room.statut === 'maintenance') {
        return {
          data: {
            available: false,
            reason: 'Room is under maintenance'
          },
          error: null,
          success: true
        }
      }

      // Check for conflicting reservations
      const { data: conflictingReservations, error: resError } = await supabase
        .from('reservations')
        .select('id, date_arrivee, date_depart, statut')
        .eq('room_id', roomId)
        .in('statut', ['CONFIRMEE', 'EN_COURS'])
        .or(`date_arrivee.lte.${dates.dateDepart},date_depart.gte.${dates.dateArrivee}`)

      if (resError) {
        console.error('Error checking room availability:', resError)
        return {
          data: {
            available: false,
            reason: 'Error checking reservations'
          },
          error: resError.message,
          success: false
        }
      }

      const hasConflicts = conflictingReservations && conflictingReservations.length > 0
      
      return {
        data: {
          available: !hasConflicts,
          conflictingReservations: conflictingReservations || [],
          reason: hasConflicts ? 'Room has conflicting reservations' : undefined
        },
        error: null,
        success: true
      }
    } catch (err) {
      console.error('Unexpected error checking room availability:', err)
      return {
        data: {
          available: false,
          reason: 'Unexpected error occurred'
        },
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false
      }
    }
  },

  /**
   * Get available rooms for a date range
   */
  async getAvailableRooms(
    hotelId: number,
    dateArrivee: string,
    dateDepart: string
  ): Promise<ApiListResponse<Room>> {
    try {
      // First get all rooms for the hotel
      const { data: allRooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('statut', 'disponible')

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError)
        return {
          data: null,
          error: roomsError.message,
          success: false
        }
      }

      if (!allRooms || allRooms.length === 0) {
        return {
          data: [],
          error: null,
          success: true,
          count: 0
        }
      }

      // Check for conflicting reservations
      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select('room_id')
        .eq('hotel_id', hotelId)
        .in('statut', ['CONFIRMEE', 'EN_COURS'])
        .or(`date_arrivee.lte.${dateDepart},date_depart.gte.${dateArrivee}`)

      if (resError) {
        console.error('Error checking reservations:', resError)
        // Return all rooms if we can't check reservations
        const normalizedRooms = allRooms.map(normalizeRoomData)
        return {
          data: normalizedRooms,
          error: null,
          success: true,
          count: normalizedRooms.length
        }
      }

      // Filter out rooms with conflicting reservations
      const bookedRoomIds = new Set(reservations?.map(r => r.room_id) || [])
      const availableRooms = allRooms.filter(room => !bookedRoomIds.has(room.id))

      // Normalize room data for frontend consumption
      const normalizedRooms = availableRooms.map(normalizeRoomData)
      
      return {
        data: normalizedRooms,
        error: null,
        success: true,
        count: normalizedRooms.length
      }
    } catch (err) {
      console.error('Unexpected error fetching available rooms:', err)
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
  getRooms,
  getRoomsByHotel,
  getRoomsByCategory,
  getRoom,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStatistics,
  searchRooms,
  updateRoomStatus,
  checkRoomAvailability,
  getAvailableRooms
} = roomsApi

// Default export
export default roomsApi