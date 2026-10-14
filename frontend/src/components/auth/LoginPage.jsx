import React, { useState } from 'react';
import {
  Bot,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  ArrowRight,
  Shield,
  Headphones,
  Briefcase,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// 5 Core Personas Requested
export const DEMO_PERSONAS = [
  {
    key: 'superadmin',
    label: 'Super Admin',
    name: 'Super Admin',
    email: 'admin@crm.internal',
    alias: 'superadmin@crm.internal',
    role: 'Super Admin',
    department: 'Executive IT & Governance',
    color: '#f43f5e',
    icon: Shield,
    desc: 'Unrestricted master control, RBAC policy management, system audit logs & security.'
  },
  {
    key: 'salesmanager',
    label: 'Sales Manager',
    name: 'Marcus Vance',
    email: 'manager@crm.internal',
    alias: 'salesmanager@crm.internal',
    role: 'Sales Manager',
    department: 'Global Sales Operations',
    color: '#f59e0b',
    icon: Briefcase,
    desc: 'Pipeline velocity, team quotas, high-value deal approvals & forecast analytics.'
  },
  {
    key: 'salesrep',
    label: 'Sales Representative',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@crm.internal',
    alias: 'salesrep@crm.internal',
    role: 'Sales Representative',
    department: 'Enterprise Direct Sales',
    color: '#10b981',
    icon: TrendingUp,
    desc: 'Lead prospecting, AI lead scoring, quoting, order conversion & customer accounts.'
  },
  {
    key: 'supportagent',
    label: 'Support Agent',
    name: 'David Chen',
    email: 'david.chen@crm.internal',
    alias: 'supportagent@crm.internal',
    role: 'Support Agent',
    department: 'Tier 2 Customer Success',
    color: '#38bdf8',
    icon: Headphones,
    desc: 'Ticket resolution, SLA tracking, priority complaints & customer retention.'
  },
  {
    key: 'marketinglead',
    label: 'Marketing Lead',
    name: 'Alex Morgan',
    email: 'alex.morgan@crm.internal',
    alias: 'marketinglead@crm.internal',
    role: 'Marketing Lead',
    department: 'Demand Generation & Growth',
    color: '#a855f7',
    icon: Megaphone,
    desc: 'Multi-channel campaigns, inbound lead attribution, ROI tracking & automation.'
  }
];

export const LoginPage = () => {
  const { login, loginLoading, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activePersona, setActivePersona] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    await login(email, password || 'Password@123');
  };

  const handleQuickLogin = async (persona) => {
    setActivePersona(persona.key);
    setEmail(persona.email);
    setPassword('Password@123');
    await login(persona.email, 'Password@123');
    setActivePersona(null);
  };

  const handlePreFill = (persona) => {
    setEmail(persona.email);
    setPassword('Password@123');
  };

  return (
    <div className="login-page">
      {/* Left Panel: Enterprise Branding & 5 Role Overviews */}
      <div className="login-left">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />

        <div className="login-left-content">
          {/* Logo */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <Bot size={28} />
            </div>
            <div>
              <div className="login-brand-name">Nexoraa</div>
              <div className="login-brand-sub">AI-POWERED ERP · CRM SUITE</div>
            </div>
            <span className="login-brand-badge">v2.4 Enterprise</span>
          </div>

          {/* Hero Headline */}
          <div className="login-hero">
            <h1 className="login-hero-title">
              Role-Based Access<br />
              <span className="login-hero-gradient">Tailored for Every Enterprise Team</span>
            </h1>
            <p className="login-hero-desc">
              Experience the CRM from 5 specialized perspectives. Each persona unlocks custom dashboards,
              permission-gated workflows, and autonomous AI agents.
            </p>
          </div>

          {/* 5 Personas Overview List */}
          <div>
            <div className="login-roles-showcase-title">
              <ShieldCheck size={14} style={{ color: '#818cf8' }} />
              <span>5 Core Enterprise Roles</span>
            </div>
            <div className="login-roles-list" style={{ marginTop: 12 }}>
              {DEMO_PERSONAS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.key}
                    className="login-role-summary-card"
                    onClick={() => handlePreFill(p)}
                    style={{ cursor: 'pointer' }}
                    title={`Click to pre-fill credentials for ${p.label}`}
                  >
                    <div
                      className="login-role-dot"
                      style={{
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}80`
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="login-role-name">{p.label}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>({p.name})</span>
                      </div>
                      <div className="login-role-desc">{p.desc}</div>
                    </div>
                    <Icon size={16} style={{ color: p.color, opacity: 0.8 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security & RBAC Trust Badges */}
          <div className="login-trust">
            <div className="login-trust-item">
              <ShieldCheck size={14} style={{ color: '#10b981' }} />
              <span>JWT + RBAC Matrix</span>
            </div>
            <div className="login-trust-item">
              <ShieldCheck size={14} style={{ color: '#6366f1' }} />
              <span>Audit Logging Active</span>
            </div>
            <div className="login-trust-item">
              <ShieldCheck size={14} style={{ color: '#06b6d4' }} />
              <span>AI Agent Co-Pilots</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Sign In Form + 1-Click Role Logins */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-icon">
              <Sparkles size={22} />
            </div>
            <h2 className="login-card-title">Sign In to Enterprise CRM</h2>
            <p className="login-card-sub">Select a role below or enter work credentials</p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="login-error">
              <Lock size={15} />
              <span>{loginError}</span>
            </div>
          )}

          {/* Direct Email / Password Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Work Email / Role Identifier
              </label>
              <div className="login-input-wrap">
                <Mail size={16} className="login-input-icon" />
                <input
                  id="login-email"
                  type="text"
                  className="login-input"
                  placeholder="e.g. admin@crm.internal or superadmin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="login-input-wrap">
                <Lock size={16} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Password@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={loginLoading}
            >
              {loginLoading && !activePersona ? (
                <>
                  <span className="login-spinner" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Sign In to CRM</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>Or 1-Click Sign In as Persona</span>
          </div>

          {/* 5 One-Click Persona Login Cards */}
          <div className="login-demo-grid">
            {DEMO_PERSONAS.map((p) => {
              const isCurrent = activePersona === p.key;
              const Icon = p.icon;
              return (
                <button
                  key={p.key}
                  id={`login-role-${p.key}`}
                  className="login-demo-btn"
                  onClick={() => handleQuickLogin(p)}
                  disabled={loginLoading}
                  style={{ '--demo-color': p.color }}
                  title={`Sign in as ${p.label} (${p.email})`}
                >
                  <div
                    className="login-demo-avatar"
                    style={{
                      backgroundColor: `${p.color}20`,
                      color: p.color,
                      border: `1px solid ${p.color}40`
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="login-demo-info">
                    <div className="login-demo-name">
                      <span>{p.label}</span>
                      <span
                        className="login-demo-role-badge"
                        style={{
                          backgroundColor: `${p.color}15`,
                          color: p.color,
                          border: `1px solid ${p.color}35`
                        }}
                      >
                        {p.role}
                      </span>
                    </div>
                    <div className="login-demo-email">
                      {p.name} · {p.email}
                    </div>
                  </div>
                  <div className="login-demo-action-pill">
                    {isCurrent ? (
                      <span className="login-spinner" style={{ width: 13, height: 13 }} />
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight size={12} />
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Password Reminder */}
          <div className="login-hint">
            Default credentials: All 5 accounts use <code>Password@123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
