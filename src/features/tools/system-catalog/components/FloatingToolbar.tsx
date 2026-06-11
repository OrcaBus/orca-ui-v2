import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  Search,
  X,
  Plus,
  ChevronDown,
  Layers,
  Pencil,
  Trash2,
  Save,
  Network,
} from 'lucide-react';
import type { GroupFilterItem } from '../types/system-catalog.types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FloatingToolbarProps {
  mapName?: string;
  groups: GroupFilterItem[];
  selectedGroup: string;
  searchQuery: string;
  nodeCount: number;
  onMapNameClick: () => void;
  onSelectGroup: (groupId: string) => void;
  onSearchChange: (query: string) => void;
  onAddNode: () => void;
  onAutoLayout: () => void;
  onSave: () => void;
  onAddGroup: () => void;
  onEditGroup: (group: GroupFilterItem) => void;
  onDeleteGroup: (group: GroupFilterItem) => void;
  isDirty: boolean;
  isSaving: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FloatingToolbar({
  mapName,
  groups,
  selectedGroup,
  searchQuery,
  nodeCount,
  onMapNameClick,
  onSelectGroup,
  onSearchChange,
  onAddNode,
  onAutoLayout,
  onSave,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  isDirty,
  isSaving,
}: FloatingToolbarProps) {
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeGroup = groups.find((g) => g.id === selectedGroup);

  // Close group dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target as Node)) {
        setIsGroupDropdownOpen(false);
      }
    }
    if (isGroupDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isGroupDropdownOpen]);

  // Auto-focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  return (
    <div className='pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-3'>
      <div className='pointer-events-auto flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/95 px-2.5 py-1.5 shadow-lg shadow-slate-200/50 backdrop-blur-sm dark:border-[#2d3540]/80 dark:bg-[#111418]/95 dark:shadow-black/20'>
        {/* Back button */}
        <Link
          to='/tools/system-catalog'
          className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:bg-[#1e252e] dark:hover:text-white'
          title='Back to Maps'
        >
          <ArrowLeft className='h-4 w-4' />
        </Link>

        {/* Map name (opens details modal) */}
        {mapName && (
          <button
            type='button'
            onClick={onMapNameClick}
            className='max-w-48 truncate rounded-lg px-2 py-1 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-[#1e252e]'
            title='View map details'
          >
            {mapName}
          </button>
        )}

        <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

        {/* Group dropdown */}
        <div ref={groupDropdownRef} className='relative'>
          <button
            type='button'
            onClick={() => setIsGroupDropdownOpen((prev) => !prev)}
            className='flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1e252e]'
          >
            {activeGroup && activeGroup.id !== 'ALL' ? (
              <>
                <div className='h-2 w-2 rounded-full' style={{ background: activeGroup.color }} />
                <span className='max-w-35 truncate'>{activeGroup.name}</span>
              </>
            ) : (
              <>
                <Layers className='h-3.5 w-3.5 text-slate-400 dark:text-[#6b7a8d]' />
                <span>All Groups</span>
              </>
            )}
            <ChevronDown className='h-3 w-3 text-slate-400 dark:text-[#6b7a8d]' />
          </button>

          {isGroupDropdownOpen && (
            <div className='absolute top-full left-0 mt-1.5 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418]'>
              <div className='p-1.5'>
                {groups.map((group) => {
                  const isActive = selectedGroup === group.id;
                  const isAllGroup = group.id === 'ALL';
                  return (
                    <div
                      key={group.id}
                      className={`group/item flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-slate-100 font-medium text-slate-900 dark:bg-[#1e252e] dark:text-white'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]/60'
                      }`}
                    >
                      <button
                        type='button'
                        onClick={() => {
                          onSelectGroup(group.id);
                          setIsGroupDropdownOpen(false);
                        }}
                        className='flex min-w-0 flex-1 items-center gap-2.5'
                      >
                        <div
                          className='h-2 w-2 shrink-0 rounded-full'
                          style={{ background: group.color }}
                        />
                        <span className='flex-1 truncate text-left'>{group.name}</span>
                        <span className='text-xs text-slate-400 dark:text-[#6b7a8d]'>
                          {group.count}
                        </span>
                      </button>

                      {/* Edit / Delete icons — visible on hover, hidden for ALL */}
                      {!isAllGroup && (
                        <div className='flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/item:opacity-100'>
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsGroupDropdownOpen(false);
                              onEditGroup(group);
                            }}
                            className='rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-[#6b7a8d] dark:hover:bg-[#2d3540] dark:hover:text-white'
                            title='Edit group'
                          >
                            <Pencil className='h-3 w-3' />
                          </button>
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsGroupDropdownOpen(false);
                              onDeleteGroup(group);
                            }}
                            className='rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-[#6b7a8d] dark:hover:bg-red-900/20 dark:hover:text-red-400'
                            title='Delete group'
                          >
                            <Trash2 className='h-3 w-3' />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className='border-t border-slate-100 p-1.5 dark:border-[#2d3540]'>
                <button
                  type='button'
                  onClick={() => {
                    setIsGroupDropdownOpen(false);
                    onAddGroup();
                  }}
                  className='flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                >
                  <Plus className='h-3.5 w-3.5' />
                  Add Group
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active group badge */}
        {activeGroup && activeGroup.id !== 'ALL' && (
          <button
            type='button'
            onClick={() => onSelectGroup('ALL')}
            className='flex h-6 items-center gap-1 rounded-full pr-1 pl-2 text-xs font-medium transition-colors'
            style={{
              background: `${activeGroup.color}15`,
              color: activeGroup.color,
            }}
          >
            Focused
            <X className='h-3 w-3 opacity-60' />
          </button>
        )}

        <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

        {/* Search */}
        <div className='flex items-center'>
          {isSearchExpanded ? (
            <div className='relative'>
              <Search className='absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-[#6b7a8d]' />
              <input
                ref={searchInputRef}
                type='text'
                placeholder='Search nodes…'
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setIsSearchExpanded(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    onSearchChange('');
                    setIsSearchExpanded(false);
                  }
                }}
                className='h-8 w-48 rounded-lg border border-slate-200 bg-white py-1 pr-7 pl-8 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#6b7a8d] dark:focus:ring-blue-900/40'
              />
              {searchQuery && (
                <button
                  type='button'
                  onClick={() => {
                    onSearchChange('');
                    searchInputRef.current?.focus();
                  }}
                  className='absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:text-white'
                >
                  <X className='h-3 w-3' />
                </button>
              )}
            </div>
          ) : (
            <button
              type='button'
              onClick={() => setIsSearchExpanded(true)}
              className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:bg-[#1e252e] dark:hover:text-white'
              title='Search nodes'
            >
              <Search className='h-4 w-4' />
            </button>
          )}
        </div>

        <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

        {/* Add node */}
        <button
          type='button'
          onClick={onAddNode}
          className='flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
        >
          <Plus className='h-3.5 w-3.5' />
          <span className='hidden sm:inline'>Add Node</span>
        </button>

        <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

        {/* Auto layout */}
        <button
          type='button'
          onClick={onAutoLayout}
          title='Auto layout'
          className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:bg-[#1e252e] dark:hover:text-white'
        >
          <Network className='h-4 w-4' />
        </button>

        <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

        <button
          type='button'
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className='flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:text-slate-200 dark:hover:bg-[#1e252e]'
        >
          <Save className='h-3.5 w-3.5' />
          <span className='hidden sm:inline'>
            {isSaving ? 'Saving…' : isDirty ? 'Save' : 'Saved'}
          </span>
        </button>

        <div className='mx-0.5 h-5 w-px bg-slate-200 dark:bg-[#2d3540]' />

        {/* Node count */}
        <span className='px-1 text-xs text-slate-400 dark:text-[#6b7a8d]'>{nodeCount} nodes</span>
      </div>
    </div>
  );
}
