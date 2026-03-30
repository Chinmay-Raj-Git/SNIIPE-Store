import { useTheme } from '../../theme/ThemeContext'

/**
 * AddressCard — displays one address; can be selected or deleted.
 */
export default function AddressCard({ address, selected, onSelect, onDelete, deleting }) {
  const { theme } = useTheme()

  return (
    <div
      onClick={() => onSelect?.(address.id)}
      style={{
        padding: '16px 18px', borderRadius: '12px',
        border: `2px solid ${selected ? theme.primary : theme.border}`,
        backgroundColor: selected ? theme.primaryMuted : theme.surface,
        cursor: 'pointer', transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = `${theme.primary}55` }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = theme.border }}
    >
      {/* Radio + label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          border: `2px solid ${selected ? theme.primary : theme.border}`,
          backgroundColor: selected ? theme.primary : 'transparent',
          flexShrink: 0, transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#fff' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: theme.textPrimary }}>
            {address.full_name}
          </span>
          {address.label && (
            <span style={{
              marginLeft: '8px', fontSize: '11px', fontWeight: 600,
              padding: '2px 8px', borderRadius: '999px',
              backgroundColor: theme.primaryMuted, color: theme.primary,
              border: `1px solid ${theme.primary}44`,
            }}>
              {address.label}
            </span>
          )}
          {address.is_default && (
            <span style={{
              marginLeft: '6px', fontSize: '10px', fontWeight: 700,
              padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.05em',
              backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.25)', textTransform: 'uppercase',
            }}>
              Default
            </span>
          )}
        </div>
        {onDelete && (
          <button onClick={e => { e.stopPropagation(); onDelete(address.id) }}
            disabled={deleting}
            style={{
              background: 'none', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer',
              color: theme.textMuted, fontSize: '13px', padding: '2px 4px',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
          >
            <i className={`fa-solid ${deleting ? 'fa-spinner' : 'fa-trash'}`}
              style={deleting ? { animation: 'spin 0.7s linear infinite' } : {}} />
          </button>
        )}
      </div>

      {/* Address text */}
      <p style={{ fontSize: '13px', color: theme.textSecondary, lineHeight: 1.6, paddingLeft: '28px' }}>
        {[
          address.address_line_1,
          address.address_line_2,
          address.city,
          address.state,
          address.pincode,
        ].filter(Boolean).join(', ')}
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px', paddingLeft: '28px' }}>
        <i className="fa-solid fa-phone" style={{ fontSize: '11px', marginRight: '6px', color: theme.iconColor }} />
        {address.phone}
      </p>
    </div>
  )
}
