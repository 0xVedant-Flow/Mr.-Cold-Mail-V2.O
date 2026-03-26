import React from 'react';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-card p-12 rounded-2xl border border-border shadow-sm text-center">
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground font-medium">This section is under development.</p>
  </div>
);

export const AdminSubscriptions = () => <Placeholder title="Subscriptions Management" />;
export const AdminPlans = () => <Placeholder title="Plans Management" />;
export const AdminUsage = () => <Placeholder title="Email Usage Monitoring" />;
export const AdminTemplates = () => <Placeholder title="Email Templates Management" />;
export const AdminSettings = () => <Placeholder title="System Settings" />;
