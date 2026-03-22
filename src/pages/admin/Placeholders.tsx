import React from 'react';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white p-12 rounded-2xl border border-black/5 shadow-sm text-center">
    <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
    <p className="text-black/40 font-medium">This section is under development.</p>
  </div>
);

export const AdminSubscriptions = () => <Placeholder title="Subscriptions Management" />;
export const AdminPlans = () => <Placeholder title="Plans Management" />;
export const AdminUsage = () => <Placeholder title="Email Usage Monitoring" />;
export const AdminTemplates = () => <Placeholder title="Email Templates Management" />;
export const AdminSettings = () => <Placeholder title="System Settings" />;
