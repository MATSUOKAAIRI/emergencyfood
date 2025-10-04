'use client';

import BagInfoSection from './BagInfoSection';
import RegisteredItems from './RegisteredItems';

interface EvacuationItem {
  name: string;
  description: string;
  priority: 'essential' | 'recommended';
}

interface EvacuationCategory {
  title: string;
  items: EvacuationItem[];
}

const primaryEvacuationData: EvacuationCategory[] = [
  {
    title: '貴重品・重要書類',
    items: [
      {
        name: '現金（小銭含む）',
        description: '公衆電話や自動販売機用',
        priority: 'essential',
      },
      {
        name: '身分証明書',
        description: '運転免許証、保険証、パスポートなど',
        priority: 'essential',
      },
      {
        name: '預金通帳・キャッシュカード',
        description: '銀行手続き用',
        priority: 'essential',
      },
      { name: '印鑑', description: '各種手続き用', priority: 'recommended' },
      {
        name: '保険証券',
        description: '生命保険、火災保険など',
        priority: 'recommended',
      },
    ],
  },
  {
    title: '安全・防護用品',
    items: [
      {
        name: 'ヘルメット・防災頭巾',
        description: '頭部保護用',
        priority: 'essential',
      },
      {
        name: '軍手・作業用手袋',
        description: 'けが防止用',
        priority: 'essential',
      },
      { name: '懐中電灯', description: '停電時の照明', priority: 'essential' },
      { name: 'ホイッスル', description: '救助要請用', priority: 'essential' },
      {
        name: 'マスク',
        description: '感染症予防・粉塵対策',
        priority: 'recommended',
      },
      {
        name: '雨具・レインコート',
        description: '雨天時の防護',
        priority: 'recommended',
      },
    ],
  },
  {
    title: '通信・情報機器',
    items: [
      {
        name: '携帯電話・スマートフォン',
        description: '連絡手段・情報収集',
        priority: 'essential',
      },
      {
        name: '携帯充電器・モバイルバッテリー',
        description: '通信機器の電源確保',
        priority: 'essential',
      },
      {
        name: 'ラジオ',
        description: '災害情報の収集',
        priority: 'recommended',
      },
      { name: '乾電池', description: '機器の電源用', priority: 'recommended' },
    ],
  },
  {
    title: '応急処置・医薬品',
    items: [
      {
        name: '救急セット',
        description: '絆創膏、消毒液、包帯など',
        priority: 'essential',
      },
      {
        name: '常備薬',
        description: '持病の薬、痛み止めなど',
        priority: 'essential',
      },
      {
        name: 'お薬手帳',
        description: '医療機関での処方用',
        priority: 'recommended',
      },
      { name: '体温計', description: '健康管理用', priority: 'recommended' },
    ],
  },
  {
    title: '最低限の生活用品',
    items: [
      {
        name: '水（500ml×2本程度）',
        description: '緊急時の水分補給',
        priority: 'essential',
      },
      {
        name: '非常食（1日分）',
        description: 'カロリーメイト、飴など',
        priority: 'essential',
      },
      { name: 'タオル', description: '汗拭き、止血用', priority: 'essential' },
      {
        name: 'ティッシュ・ウェットティッシュ',
        description: '衛生管理用',
        priority: 'recommended',
      },
      {
        name: '着替え（1日分）',
        description: '下着、靴下など',
        priority: 'recommended',
      },
      {
        name: 'ビニール袋',
        description: '防水、ゴミ入れ用',
        priority: 'recommended',
      },
    ],
  },
];

export default function PrimaryEvacuationItems() {
  return (
    <div>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          一次避難の持ち物リスト
        </h2>
        <p className='text-gray-600'>
          災害発生時の緊急避難で持参すべき最低限の物品
        </p>
      </div>

      {/* 袋情報 */}
      <BagInfoSection evacuationLevel='primary' />

      {/* 登録済みアイテム */}
      <div className='mb-8'>
        <RegisteredItems evacuationLevel='primary' />
      </div>

      {/* 推奨アイテムリスト */}
      <div className='mb-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-2 text-center'>
          推奨アイテムリスト
        </h3>
        <p className='text-gray-600 text-center mb-6'>
          一般的に推奨される一次避難用のアイテムです。参考にして備蓄品を登録してください。
        </p>
      </div>

      <div className='space-y-4'>
        {primaryEvacuationData.map((category, index) => (
          <div key={index} className='border border-gray-200 rounded-lg p-3'>
            <h3 className='text-lg font-semibold text-gray-800 mb-3'>
              {category.title}
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className='flex items-center justify-between p-2 bg-gray-50 rounded text-sm'
                >
                  <span className='font-medium text-gray-900'>{item.name}</span>
                  <span
                    className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                      item.priority === 'essential'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.priority === 'essential' ? '必須' : '推奨'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <h4 className='font-semibold text-gray-900 mb-2'>一次避難時の注意点</h4>
        <ul className='text-gray-800 text-sm space-y-1'>
          <li>• 重量は10kg以下に抑える（徒歩避難を想定）</li>
          <li>• 両手が使えるようにリュックサックに収納</li>
          <li>• 家族分の必需品を分散して持参</li>
          <li>• 定期的に中身をチェックし、賞味期限を確認</li>
        </ul>
      </div>
    </div>
  );
}
