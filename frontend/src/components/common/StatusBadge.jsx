import React from 'react';

export const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  let badgeClass = 'badge-slate';

  const val = String(status).toLowerCase();

  if (type === 'score' || val === 'hot' || val === 'critical' || val === 'closed won' || val === 'accepted' || val === 'completed' || val === 'qualified' || val === 'active') {
    if (val === 'hot' || val === 'critical') badgeClass = 'badge-red';
    else if (val === 'closed won' || val === 'accepted' || val === 'completed' || val === 'qualified' || val === 'active') badgeClass = 'badge-green';
  }

  if (val === 'warm' || val === 'high' || val === 'negotiation' || val === 'proposal' || val === 'sent' || val === 'in progress') {
    badgeClass = 'badge-amber';
  }

  if (val === 'cold' || val === 'low' || val === 'new' || val === 'draft' || val === 'open') {
    badgeClass = 'badge-blue';
  }

  if (val === 'converted' || val === 'strategic partner' || val === 'enterprise') {
    badgeClass = 'badge-purple';
  }

  if (val === 'closed lost' || val === 'rejected' || val === 'cancelled' || val === 'at risk' || val === 'churned') {
    badgeClass = 'badge-red';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
