'use client';

import type { FamilyAgreement, SafetyConfirmationMethod } from '@/types/forms';

import { FamilyAgreementsForm } from './FamilyAgreementsForm';
import { SafetyMethodsForm } from './SafetyMethodsForm';

interface CommunicationTabProps {
  methods: SafetyConfirmationMethod[];
  agreements: FamilyAgreement[];
  onMethodsUpdate: (methods: SafetyConfirmationMethod[]) => void;
  onAgreementsUpdate: (agreements: FamilyAgreement[]) => void;
}

export function CommunicationTab({
  methods,
  agreements,
  onMethodsUpdate,
  onAgreementsUpdate,
}: CommunicationTabProps) {
  return (
    <div className='space-y-8'>
      {/* 安否確認手段 */}
      <SafetyMethodsForm methods={methods} onUpdate={onMethodsUpdate} />

      {/* 家族の約束事 */}
      <FamilyAgreementsForm
        agreements={agreements}
        onUpdate={onAgreementsUpdate}
      />
    </div>
  );
}
