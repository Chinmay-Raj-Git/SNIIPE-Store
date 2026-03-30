import { useState, useCallback, useEffect } from 'react'
import {
  apiFetchAddresses,
  apiAddAddress,
  apiSetDefaultAddress,
  apiDeleteAddress,
} from '../api/addressApi'

export function useAddresses() {
  const [addresses, setAddresses]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const fetchAddresses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await apiFetchAddresses()
      setAddresses(list)
    } catch (e) {
      setError('Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  const addAddress = useCallback(async (payload) => {
    await apiAddAddress(payload)
    await fetchAddresses()
  }, [fetchAddresses])

  const setDefault = useCallback(async (addressId) => {
    await apiSetDefaultAddress(addressId)
    await fetchAddresses()
  }, [fetchAddresses])

  const deleteAddress = useCallback(async (addressId) => {
    await apiDeleteAddress(addressId)
    await fetchAddresses()
  }, [fetchAddresses])

  const defaultAddress = addresses.find(a => a.is_default) ?? addresses[0] ?? null

  return { addresses, loading, error, fetchAddresses, addAddress, setDefault, deleteAddress, defaultAddress }
}
