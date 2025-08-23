/**
 * Example usage of the Establishments API
 * This file demonstrates how to use the API in your components
 */

import { useState } from 'react'
import { establishmentsApi, type Establishment } from './establishments'

// Example: Component hook for managing establishments
export function useEstablishmentsExample() {
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all establishments
  const fetchEstablishments = async (filters?: any) => {
    setLoading(true)
    setError(null)
    
    const result = await establishmentsApi.getEstablishments(filters)
    
    if (result.success) {
      setEstablishments(result.data || [])
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  // Create new establishment
  const createEstablishment = async (data: any) => {
    setLoading(true)
    setError(null)
    
    const result = await establishmentsApi.createEstablishment(data)
    
    if (result.success) {
      // Refresh the list
      await fetchEstablishments()
      return result.data
    } else {
      setError(result.error)
      return null
    }
    
    setLoading(false)
  }

  // Update establishment
  const updateEstablishment = async (id: number, data: any) => {
    setLoading(true)
    setError(null)
    
    const result = await establishmentsApi.updateEstablishment(id, data)
    
    if (result.success) {
      // Update local state
      setEstablishments(prev => 
        prev.map(est => est.id === id ? result.data! : est)
      )
      return result.data
    } else {
      setError(result.error)
      return null
    }
    
    setLoading(false)
  }

  // Delete establishment
  const deleteEstablishment = async (id: number) => {
    setLoading(true)
    setError(null)
    
    const result = await establishmentsApi.deleteEstablishment(id)
    
    if (result.success) {
      // Remove from local state
      setEstablishments(prev => prev.filter(est => est.id !== id))
      return true
    } else {
      setError(result.error)
      return false
    }
    
    setLoading(false)
  }

  return {
    establishments,
    loading,
    error,
    fetchEstablishments,
    createEstablishment,
    updateEstablishment,
    deleteEstablishment
  }
}

// Example: Server-side API route usage
export async function serverSideExample() {
  try {
    // Fetch establishments with filters
    const activeEstablishments = await establishmentsApi.getEstablishments({
      statut: 'ACTIF',
      is_active: true,
      limit: 10
    })

    if (!activeEstablishments.success) {
      throw new Error(activeEstablishments.error || 'Failed to fetch establishments')
    }

    // Get detailed establishment info
    const establishmentDetails = await establishmentsApi.getEstablishmentWithDetails(1)
    
    if (!establishmentDetails.success) {
      throw new Error(establishmentDetails.error || 'Failed to fetch establishment details')
    }

    // Get statistics
    const stats = await establishmentsApi.getEstablishmentStatistics(1)
    
    if (!stats.success) {
      throw new Error(stats.error || 'Failed to fetch statistics')
    }

    return {
      establishments: activeEstablishments.data,
      details: establishmentDetails.data,
      statistics: stats.data
    }
  } catch (error) {
    console.error('Error in server-side example:', error)
    throw error
  }
}

// Example: Form submission handler
export async function handleEstablishmentSubmit(formData: any) {
  try {
    // Validate required fields
    if (!formData.nom || !formData.adresse || !formData.ville) {
      throw new Error('Required fields missing')
    }

    // Create establishment
    const result = await establishmentsApi.createEstablishment({
      nom: formData.nom,
      adresse: formData.adresse,
      ville: formData.ville,
      code_postal: formData.code_postal,
      telephone: formData.telephone,
      email: formData.email,
      gestionnaire: formData.gestionnaire,
      type_etablissement: formData.type_etablissement || 'hotel',
      description: formData.description,
      chambres_total: parseInt(formData.chambres_total) || 0
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to create establishment')
    }

    return {
      success: true,
      data: result.data,
      message: 'Establishment created successfully'
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Example: Search functionality
export async function searchEstablishments(query: string) {
  if (!query.trim()) {
    return { results: [], total: 0 }
  }

  const result = await establishmentsApi.searchEstablishments(query, 20)
  
  if (!result.success) {
    console.error('Search error:', result.error)
    return { results: [], total: 0 }
  }

  return {
    results: result.data || [],
    total: result.count || 0
  }
}