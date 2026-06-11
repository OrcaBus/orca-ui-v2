import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { NotebookText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { InfoDrawerActionCard } from '@/components/modals/InfoDrawerActionCard';
import { MapEditModal } from './MapEditModal';
import type { MapFormData } from './MapEditModal';
import { useCreateSystemCatalogMap, systemCatalogMapsQuery } from '../api/system-catalog.api';
import { mapToSummary } from '../utils/mapModel';
import type { MapSummary } from '../data/dynamodb-schema';

function parseTagsJson(value: string): Record<string, string> {
  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

const EMPTY_MAP_FORM: MapFormData = {
  name: '',
  description: '',
  status: 'draft',
  tagsJson: '{}',
};

interface SystemCatalogInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function SystemCatalogInfoDrawer({
  isOpen,
  onClose,
  title,
  description,
}: SystemCatalogInfoDrawerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const createMapMutation = useCreateSystemCatalogMap();

  const handleCreateMap = useCallback(
    async (data: MapFormData) => {
      try {
        const createdMap = await createMapMutation.mutateAsync({
          body: {
            name: data.name,
            description: data.description,
            status: data.status,
            tags: parseTagsJson(data.tagsJson),
          },
        });

        const listQueryKey = systemCatalogMapsQuery.queryOptions().queryKey;
        queryClient.setQueryData(
          listQueryKey,
          (previous: { maps?: MapSummary[]; nextCursor?: string | null } | undefined) => {
            if (!previous?.maps) {
              return previous;
            }
            return {
              ...previous,
              maps: [mapToSummary(createdMap), ...previous.maps],
            };
          }
        );

        setIsCreateModalOpen(false);
        toast.success('Map created.');
        void navigate(`/tools/system-catalog/${createdMap.mapId}`);
      } catch {
        toast.error('Unable to create map.');
      }
    },
    [createMapMutation, navigate, queryClient]
  );

  return (
    <>
      <DrawerFrame
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        icon={<NotebookText className='h-5 w-5' />}
        size='md'
      >
        <div className='space-y-6'>
          <section>
            <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
            <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
              {description}
            </p>
          </section>

          <section>
            <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Actions</h3>
            <div className='mt-3'>
              <InfoDrawerActionCard
                title='Create a map'
                description='Start a new architecture map with metadata, status, and tags before adding nodes and groups.'
                buttonLabel='Create New Map'
                onClick={() => setIsCreateModalOpen(true)}
                icon={<NotebookText className='h-4 w-4' />}
                buttonIcon={<Plus className='h-4 w-4' />}
              />
            </div>
          </section>
        </div>
      </DrawerFrame>

      <MapEditModal
        isOpen={isCreateModalOpen}
        initialData={EMPTY_MAP_FORM}
        isEditing={false}
        onSubmit={(data) => void handleCreateMap(data)}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
