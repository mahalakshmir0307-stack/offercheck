import {
  TreePine, LayoutDashboard, PackageOpen, Lightbulb, Boxes,
  BarChart3, FileText, Database, Server, Code2, Cpu,
  Layers, Workflow, TrendingUp, Recycle, ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/Shared';

export function ArchitecturePage() {
  const layers = [
    {
      name: 'Frontend',
      icon: Code2,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      tech: 'React + TypeScript + Vite',
      description: 'Single-page application with component-based architecture. Uses Tailwind CSS for styling, Recharts for data visualization, and Lucide React for icons.',
    },
    {
      name: 'Backend',
      icon: Server,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      tech: 'Supabase (PostgreSQL + Auth + REST API)',
      description: 'Managed PostgreSQL database with Row Level Security. Supabase auto-generates REST APIs for all tables. Authentication handled via Supabase Auth.',
    },
    {
      name: 'Database',
      icon: Database,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      tech: 'PostgreSQL',
      description: 'Three core tables: wood_pieces (inventory), products (created items), and activity_logs (audit trail). Owner-scoped RLS policies ensure data isolation.',
    },
    {
      name: 'Core Engine',
      icon: Cpu,
      color: 'text-charcoal-700',
      bg: 'bg-charcoal-100',
      tech: 'Recommendation + Analytics Engine',
      description: 'Rule-based feasibility engine that scores products 0-100 based on dimension matching. Calculates material utilization, estimated cost (28% of value), profit margin, and ranks recommendations.',
    },
  ];

  const workflow = [
    { icon: PackageOpen, label: 'Inventory Management', description: 'Record leftover wood pieces with type, dimensions, quantity, and status.' },
    { icon: Layers, label: 'Material Analysis', description: 'Calculate volume (L × W × T) and assess material characteristics for each piece.' },
    { icon: Cpu, label: 'Feasibility Engine', description: 'Match wood dimensions against product catalog minimums. Score 0-100 based on dimension ratios.' },
    { icon: Lightbulb, label: 'Recommendation Engine', description: 'Rank feasible products by feasibility score, material utilization, and estimated profit.' },
    { icon: BarChart3, label: 'Business Analytics', description: 'Aggregate revenue, profit, utilization rate, and waste reduction across all operations.' },
    { icon: Boxes, label: 'Product Tracking', description: 'Track products through planned, in production, completed, and sold stages with cost and revenue data.' },
  ];

  const businessMetrics = [
    { icon: Recycle, label: 'Waste Reduction', description: 'Percentage of leftover material with reuse potential.' },
    { icon: TrendingUp, label: 'Revenue Opportunity', description: 'Total estimated value of feasible products from available wood.' },
    { icon: Layers, label: 'Material Utilization', description: 'Ratio of product volume to wood volume, indicating efficiency.' },
    { icon: BarChart3, label: 'Profit Analysis', description: 'Estimated profit and margin per product, aggregated by category and wood type.' },
  ];

  const techStack = [
    { category: 'Framework', value: 'React 18 + TypeScript' },
    { category: 'Build Tool', value: 'Vite 5' },
    { category: 'Styling', value: 'Tailwind CSS 3' },
    { category: 'Charts', value: 'Recharts 3' },
    { category: 'Icons', value: 'Lucide React' },
    { category: 'Routing', value: 'React Router 7' },
    { category: 'Database', value: 'PostgreSQL (Supabase)' },
    { category: 'Auth', value: 'Supabase Auth' },
    { category: 'API', value: 'Supabase REST (auto-generated)' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Architecture"
        description="WoodValue Material Intelligence and Business Decision Support Platform."
      />

      {/* Overview */}
      <Card className="p-6 bg-charcoal-50 border-charcoal-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-700 flex items-center justify-center flex-shrink-0">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">WoodValue</h2>
            <p className="text-sm text-charcoal-600 mt-1 max-w-3xl">
              A Material Intelligence and Business Decision Support Platform for sawmills and carpentry
              businesses. WoodValue helps convert leftover wood into valuable reusable products through
              inventory management, feasibility-based product recommendations, and comprehensive business analytics.
            </p>
          </div>
        </div>
      </Card>

      {/* Architecture layers */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-900 mb-3">Architecture Layers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layers.map(layer => (
            <Card key={layer.name}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-md ${layer.bg} flex items-center justify-center flex-shrink-0`}>
                    <layer.icon className={`w-5 h-5 ${layer.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-charcoal-900">{layer.name}</h3>
                    </div>
                    <p className="text-xs font-medium text-amber-700 mb-1.5">{layer.tech}</p>
                    <p className="text-xs text-charcoal-600 leading-relaxed">{layer.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Core workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-amber-700" />
            Core Engine Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflow.map((step, i) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-amber-700" />
                  </div>
                  {i < workflow.length - 1 && <div className="w-px h-6 bg-charcoal-200 mt-1" />}
                </div>
                <div className="pt-1">
                  <p className="text-sm font-medium text-charcoal-900">{step.label}</p>
                  <p className="text-xs text-charcoal-500 mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business value */}
      <div>
        <h2 className="text-sm font-semibold text-charcoal-900 mb-3">Business Value</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {businessMetrics.map(metric => (
            <Card key={metric.label} className="p-4">
              <div className="w-8 h-8 rounded-md bg-charcoal-100 flex items-center justify-center mb-2.5">
                <metric.icon className="w-4 h-4 text-charcoal-700" />
              </div>
              <p className="text-sm font-semibold text-charcoal-900">{metric.label}</p>
              <p className="text-xs text-charcoal-500 mt-1">{metric.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <Card>
        <CardHeader><CardTitle>Technology Stack</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {techStack.map(item => (
              <div key={item.category} className="p-3 rounded-md border border-charcoal-200 bg-charcoal-50">
                <p className="text-[11px] text-charcoal-400">{item.category}</p>
                <p className="text-sm font-medium text-charcoal-900 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="p-5 bg-charcoal-50 border-charcoal-200">
        <h3 className="text-sm font-semibold text-charcoal-900 mb-3">Platform Modules</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
            { icon: PackageOpen, label: 'Inventory', to: '/inventory' },
            { icon: Lightbulb, label: 'Recommendations', to: '/suggestions' },
            { icon: Boxes, label: 'Products', to: '/products' },
            { icon: BarChart3, label: 'Analytics', to: '/analytics' },
            { icon: FileText, label: 'Reports', to: '/reports' },
          ].map(item => (
            <a key={item.label} href={item.to} className="flex flex-col items-center gap-1.5 p-3 rounded-md border border-charcoal-200 bg-white hover:border-amber-300 hover:shadow-sm transition-all">
              <item.icon className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-medium text-charcoal-700">{item.label}</span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
