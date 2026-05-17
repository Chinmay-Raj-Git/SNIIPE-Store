import { useState } from 'react'
import { useTheme } from '../../theme/ThemeContext'
import AddressCard from './AddressCard'

const EMPTY_FORM = {
  label: '', full_name: '', phone: '',
  address_line_1: '', address_line_2: '',
  city: '', state: '', pincode: '',
}

export default function AddressSelector({ addresses, selectedId, onSelect, onAdd, addLoading, onDelete, deleteLoading }) {
  const { theme } = useTheme()
  const [showForm, setShowForm] = useState(addresses.length === 0)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [formErr, setFormErr]   = useState({})

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function validate() {
    const required = ['full_name', 'phone', 'address_line_1', 'city', 'state', 'pincode']
    const errs = {}
    required.forEach(k => { if (!form[k].trim()) errs[k] = 'Required' })
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) errs.pincode = '6-digit pincode required'
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\s+/g, ''))) errs.phone = '10-digit phone required'
    setFormErr(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    try {
      await onAdd(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      setFormErr({})
    } catch (err) {
      setFormErr({ _global: err?.response?.data?.error ?? 'Failed to save address' })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Existing addresses */}
      {addresses.map(a => (
        <AddressCard
          key={a.id} address={a}
          selected={a.id === selectedId}
          onSelect={onSelect}
          onDelete={onDelete}
          deleting={deleteLoading === a.id}
        />
      ))}

      {/* Add new toggle */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px', borderRadius: '12px',
          border: `1.5px dashed ${theme.border}`,
          backgroundColor: 'transparent', cursor: 'pointer',
          color: theme.primary, fontWeight: 600, fontSize: '14px',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.primary; e.currentTarget.style.backgroundColor = theme.primaryMuted }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <i className="fa-solid fa-plus" style={{ fontSize: '12px' }} />
          Add New Address
        </button>
      )}

      {/* Address form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          backgroundColor: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: '12px', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.textPrimary, marginBottom: '4px' }}>
            New Delivery Address
          </h3>

          {formErr._global && (
            <p style={{ fontSize: '13px', color: '#ef4444', display: 'flex', gap: '6px' }}>
              <i className="fa-solid fa-circle-exclamation" /> {formErr._global}
            </p>
          )}

          <FormRow>
            <AddrField label="Label (optional)" value={form.label} onChange={v => set('label', v)} placeholder="Home / Office" theme={theme} />
            <AddrField label="Full Name *" value={form.full_name} onChange={v => set('full_name', v)} placeholder="As per ID" theme={theme} error={formErr.full_name} />
          </FormRow>
          <FormRow>
            <AddrField label="Phone *" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="10-digit number" theme={theme} error={formErr.phone} />
            <AddrField label="Pincode *" value={form.pincode} onChange={v => set('pincode', v)} placeholder="6-digit pincode" theme={theme} error={formErr.pincode} />
          </FormRow>
          <AddrField label="Address Line 1 *" value={form.address_line_1} onChange={v => set('address_line_1', v)} placeholder="House / flat no., street" theme={theme} error={formErr.address_line_1} />
          <AddrField label="Address Line 2" value={form.address_line_2} onChange={v => set('address_line_2', v)} placeholder="Area, landmark (optional)" theme={theme} />
          <FormRow>
            <AddrField label="City *" value={form.city} onChange={v => set('city', v)} placeholder="City" theme={theme} error={formErr.city} />
            <AddrField label="State *" value={form.state} onChange={v => set('state', v)} placeholder="State" theme={theme} error={formErr.state} />
          </FormRow>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="submit" disabled={addLoading} style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
              background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`,
              color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: addLoading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {addLoading
                ? <><BtnSpinner /> Saving…</>
                : <><i className="fa-solid fa-check" /> Save Address</>}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={() => { setShowForm(false); setFormErr({}) }} style={{
                padding: '12px 18px', borderRadius: '10px',
                border: `1.5px solid ${theme.border}`,
                background: 'none', color: theme.textSecondary,
                fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

function FormRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>{children}</div>
}

function AddrField({ label, type = 'text', value, onChange, placeholder, theme, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 700,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color: theme.textMuted, marginBottom: '6px',
      }}>{label}</label>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
          border: `1.5px solid ${error ? '#ef4444' : focused ? theme.primary : theme.border}`,
          backgroundColor: theme.background, color: theme.textPrimary, outline: 'none',
          transition: 'border-color 0.2s',
        }}
      />
      {error && (
        <p style={{ marginTop: '4px', fontSize: '11px', color: '#ef4444' }}>{error}</p>
      )}
    </div>
  )
}

function BtnSpinner() {
  return (
    <span style={{
      width: '14px', height: '14px', borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
      animation: 'spin 0.7s linear infinite', display: 'inline-block',
    }} />
  )
}
