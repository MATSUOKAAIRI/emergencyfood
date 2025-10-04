'use client';

import type {
  EmergencyItem,
  EvacuationRoute,
  EvacuationSite,
} from '@/types/forms';

import { EmergencyItemsForm } from './EmergencyItemsForm';
import { EvacuationRoutesForm } from './EvacuationRoutesForm';
import { EvacuationSitesForm } from './EvacuationSitesForm';

interface EvacuationTabProps {
  sites: EvacuationSite[];
  routes: EvacuationRoute[];
  items: EmergencyItem[];
  onSitesUpdate: (sites: EvacuationSite[]) => void;
  onRoutesUpdate: (routes: EvacuationRoute[]) => void;
  onItemsUpdate: (items: EmergencyItem[]) => void;
}

export function EvacuationTab({
  sites,
  routes,
  items,
  onSitesUpdate,
  onRoutesUpdate,
  onItemsUpdate,
}: EvacuationTabProps) {
  return (
    <div className='space-y-8'>
      <EvacuationSitesForm sites={sites} onUpdate={onSitesUpdate} />

      <EvacuationRoutesForm routes={routes} onUpdate={onRoutesUpdate} />

      <EmergencyItemsForm items={items} onUpdate={onItemsUpdate} />
    </div>
  );
}
