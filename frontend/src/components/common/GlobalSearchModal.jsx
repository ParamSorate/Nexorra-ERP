import React, { useState, useEffect } from 'react';
import { Search, X, Users, Building2, TrendingUp, LifeBuoy, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export const GlobalSearchModal = () => {
  const { globalSearchOpen, setGlobalSearchOpen, setActiveModule } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ leads: [], accounts: [], opportunities: [], tickets: [] });
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults({ leads: [], accounts: [], opportunities: [], tickets: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [leadsRes, accountsRes, oppsRes, ticketsRes] = await Promise.all([
          api.getLeads({ search: searchTerm, limit: 3 }).catch(() => ({ data: [] })),
          api.getAccounts({ search: searchTerm, limit: 3 }).catch(() => ({ data: [] })),
          api.getOpportunities({ search: searchTerm, limit: 3 }).catch(() => ({ data: [] })),
          api.getTickets({ search: searchTerm }).catch(() => ({ data: [] }))
        ]);

        setResults({
          leads: leadsRes.data || [],
          accounts: accountsRes.data || [],
          opportunities: oppsRes.data || [],
          tickets: (ticketsRes.data || []).slice(0, 3)
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!globalSearchOpen) return null;

  const navigateTo = (mod) => {
    setActiveModule(mod);
    setGlobalSearchOpen(false);
  };

  const hasAnyResults = results.leads.length > 0 || results.accounts.length > 0 || results.opportunities.length > 0 || results.tickets.length > 0;

  return (
    <div className="modal-overlay" onClick={() => setGlobalSearchOpen(false)}>
      <div className="modal-content" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <Search size={20} style={{ color: '#818cf8' }} />
          <input
            type="text"
            placeholder="Type to search leads, accounts, deals, or support tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={() => setGlobalSearchOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '16px 20px' }}>
          {searching && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Searching across CRM database...
            </div>
          )}

          {!searching && !searchTerm && (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Search by lead name, company, email, deal title, or ticket number.
            </div>
          )}

          {!searching && searchTerm && !hasAnyResults && (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for "{searchTerm}".
            </div>
          )}

          {results.leads.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93c5fd', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} /> Leads ({results.leads.length})
              </div>
              {results.leads.map((l) => (
                <div
                  key={l._id}
                  onClick={() => navigateTo('leads')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    marginBottom: 6,
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{l.firstName} {l.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.company} • {l.leadSource}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: '#fcd34d', fontWeight: 600 }}>{l.leadScore}/100</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.accounts.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c4b5fd', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={14} /> Accounts ({results.accounts.length})
              </div>
              {results.accounts.map((a) => (
                <div
                  key={a._id}
                  onClick={() => navigateTo('accounts')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    marginBottom: 6,
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{a.companyName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.industry} • Health: {a.healthScore}%</div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />
                </div>
              ))}
            </div>
          )}

          {results.opportunities.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6ee7b7', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={14} /> Deals ({results.opportunities.length})
              </div>
              {results.opportunities.map((o) => (
                <div
                  key={o._id}
                  onClick={() => navigateTo('opportunities')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    marginBottom: 6,
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{o.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stage: {o.stage} • ₹{o.amount.toLocaleString()}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />
                </div>
              ))}
            </div>
          )}

          {results.tickets.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fda4af', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <LifeBuoy size={14} /> Support Tickets ({results.tickets.length})
              </div>
              {results.tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => navigateTo('service')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input)',
                    marginBottom: 6,
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{t.ticketId}: {t.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.customerName} • {t.priority}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
