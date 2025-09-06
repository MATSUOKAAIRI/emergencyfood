'use client';

import { DisasterDialInfo } from './DisasterDialInfo';

interface BasicInfoTabProps {
  useDisasterDial: boolean;
  onToggleUse: (use: boolean) => void;
}

export function BasicInfoTab({
  useDisasterDial,
  onToggleUse,
}: BasicInfoTabProps) {
  return (
    <div className='space-y-8'>
      {/* 災害用伝言ダイヤル情報 */}
      <DisasterDialInfo
        useDisasterDial={useDisasterDial}
        onToggleUse={onToggleUse}
      />

      {/* 今後、その他の基本情報があればここに追加 */}
    </div>
  );
}
