import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { Settings, FileText, Workflow, ArrowRight } from 'lucide-react';

export function ToolsPage() {
  const tools = [
    {
      id: 'sscheck',
      name: 'SSChecker',
      description: 'Validate sample sheet format and contents with configurable logging output.',
      icon: FileText,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      hoverBorder: 'hover:border-blue-300',
      route: '/tools/sscheck',
      tags: ['Validation', 'Sample Sheets'],
      learnMoreUrl: '#',
    },
    {
      id: 'workflow-catalog',
      name: 'Workflow Diagram / Event Catalog',
      description: 'Explore workflows and events in an interactive diagram and searchable catalog.',
      icon: Workflow,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      hoverBorder: 'hover:border-green-300',
      route: '/tools/workflow-catalog',
      tags: ['Workflows', 'Documentation', 'Interactive', 'Events'],
      learnMoreUrl: '#',
    },
  ];

  return (
    <div className='p-6'>
      <PageHeader
        title='Tools'
        description='Utilities for validating inputs and exploring workflow catalogs.'
        icon={<Settings className='h-6 w-6' />}
      />

      {/* Tool Launcher Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className={`rounded-lg border-2 border-neutral-200 bg-white p-6 transition-all dark:border-neutral-700 dark:bg-neutral-900 ${tool.hoverBorder} group hover:shadow-lg`}
            >
              {/* Tool Header */}
              <div className='mb-4 flex items-start gap-4'>
                <div
                  className={`p-3 ${tool.iconBg} dark:${tool.iconBg} shrink-0 rounded-lg transition-transform group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${tool.iconColor}`} />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
                    {tool.name}
                  </h3>
                  <p className='text-sm leading-relaxed text-neutral-600 dark:text-neutral-400'>
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className='mb-6 flex flex-wrap items-center gap-2'>
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className='flex items-center gap-3'>
                <Link
                  to={tool.route}
                  className='group/button flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700'
                >
                  Open
                  <ArrowRight className='h-4 w-4 transition-transform group-hover/button:translate-x-0.5' />
                </Link>
                {/* external link */}
                {/* <a
                  href={tool.learnMoreUrl}
                  className='flex items-center gap-1 rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800'
                >
                  Learn more
                  <ExternalLink className='h-3.5 w-3.5' />
                </a> */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboarding Help Text */}
      <div className='mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
        <div className='flex items-start gap-3'>
          <Settings className='mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400' />
          <div>
            <h4 className='mb-2 text-sm font-medium text-blue-900 dark:text-blue-100'>
              Getting Started with Tools
            </h4>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              These utilities help you validate inputs before workflow execution and explore
              available workflow patterns. No interaction with our systems data. Select a tool card
              above to launch the interface.
            </p>
            <p className='mt-2 text-sm text-blue-700 dark:text-blue-300'>
              More tools coming soon! If you have suggestions for useful utilities, please reach out
              to the team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
