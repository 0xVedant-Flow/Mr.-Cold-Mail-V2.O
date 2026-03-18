import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Copy, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Zap, 
  Target, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const templates = [
  { id: 1, name: 'Tech Founder Outreach', tone: 'Professional', goal: 'Book call', preview: "Hey [Name], I saw your recent expansion at [Company] and thought you might find...", color: 'bg-primary/10 text-primary' },
  { id: 2, name: 'Marketing Manager Intro', tone: 'Friendly', goal: 'Get reply', preview: "Hi [Name], I've been following [Company]'s marketing campaigns and I'm impressed...", color: 'bg-purple-500/10 text-purple-500' },
  { id: 3, name: 'Direct Sales Pitch', tone: 'Direct', goal: 'Demo request', preview: "Hello [Name], we've helped companies like yours increase their reply rates by 300%...", color: 'bg-emerald-500/10 text-emerald-500' },
  { id: 4, name: 'Casual Follow-up', tone: 'Casual', goal: 'Get reply', preview: "Hey [Name], just wanted to circle back on my previous email. Did you have a chance...", color: 'bg-cyan-500/10 text-cyan-500' },
];

export const Templates = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Templates</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your email templates and AI prompts</p>
        </div>
        <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all">
          <Plus size={20} />
          New Template
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search templates..." 
          className="w-full pl-12 pr-4 py-3 glass rounded-2xl border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-[32px] card-hover border-border/40 flex flex-col group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", template.color)}>
                <Sparkles size={24} />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                  <Edit3 size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-4">{template.name}</h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {template.tone}
              </span>
              <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {template.goal}
              </span>
            </div>

            <div className="p-4 bg-muted/50 rounded-2xl text-xs text-slate-500 leading-relaxed font-medium mb-8 flex-grow">
              {template.preview}
            </div>

            <div className="flex items-center gap-3">
              <button className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                Use Template <ArrowRight size={16} />
              </button>
              <button className="p-3 glass rounded-xl text-slate-400 hover:text-primary transition-all">
                <Copy size={18} />
              </button>
            </div>
          </motion.div>
        ))}

        {/* New Template Placeholder */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          className="glass p-8 rounded-[32px] border-2 border-dashed border-border/60 flex flex-col items-center justify-center text-slate-400 hover:border-primary/40 hover:text-primary transition-all min-h-[350px]"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus size={32} />
          </div>
          <div className="text-lg font-bold">Create New Template</div>
          <div className="text-sm font-medium">Save your best prompts for later</div>
        </motion.button>
      </div>
    </div>
  );
};
