import {
  CheckCircle,
  XCircle,
  Ban,
  Archive,
  Loader,
  ShieldCheck,
  ShieldQuestion,
  CircleDot,
  CircleOff,
  Hash,
  MessageCircleCheck,
  NotebookPen,
} from 'lucide-react';

const filledIconProps = { fill: 'currentColor', stroke: 'white', strokeWidth: 1.5 } as const;

export function getValidationStateIcon(state: string) {
  switch (state) {
    case 'validated':
      return <ShieldCheck className='h-5 w-5 text-green-500' {...filledIconProps} />;
    case 'unvalidated':
      return <ShieldQuestion className='h-5 w-5 text-amber-500' {...filledIconProps} />;
    case 'deprecated':
      return <Archive className='h-5 w-5 text-purple-500' {...filledIconProps} />;
    case 'failed':
      return <XCircle className='h-5 w-5 text-red-500' {...filledIconProps} />;
    default:
      return null;
  }
}

export function getAnalysisTypeIcon(type: string) {
  switch (type) {
    case 'ACTIVE':
      return <CircleDot className='h-5 w-5 text-green-500' {...filledIconProps} />;
    case 'INACTIVE':
      return <CircleOff className='h-5 w-5 text-neutral-400' {...filledIconProps} />;
    case 'total':
      return <Hash className='h-5 w-5 text-blue-500' />;
    default:
      return null;
  }
}

export function getWorkflowTypeIcon(type: string) {
  switch (type) {
    case 'ACTIVE':
      return <CircleDot className='h-5 w-5 text-green-500' {...filledIconProps} />;
    case 'INACTIVE':
      return <CircleOff className='h-5 w-5 text-neutral-400' {...filledIconProps} />;
  }
}

export function getRunsStatusIcon(status: string) {
  switch (status) {
    case 'succeeded':
      return <CheckCircle className='h-5 w-5 text-green-500' {...filledIconProps} />;
    case 'failed':
      return <XCircle className='h-5 w-5 text-red-500' {...filledIconProps} />;
    case 'aborted':
      return <Ban className='h-5 w-5 text-neutral-500' {...filledIconProps} />;
    case 'resolved':
      return <MessageCircleCheck className='h-5 w-5 text-cyan-500' {...filledIconProps} />;
    case 'deprecated':
      return <Archive className='h-5 w-5 text-purple-500' {...filledIconProps} />;
    case 'ongoing':
    case 'running':
      return <Loader className='h-5 w-5 animate-spin text-blue-500' />;
    case 'draft':
      return <NotebookPen className='h-5 w-5 text-blue-500' {...filledIconProps} />;
    default:
      return null;
  }
}
