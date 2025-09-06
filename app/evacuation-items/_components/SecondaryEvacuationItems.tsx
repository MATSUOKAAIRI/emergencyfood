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

const secondaryEvacuationData: EvacuationCategory[] = [
  {
    title: '食料・水',
    items: [
      {
        name: '飲料水（3日分）',
        description: '1人1日3リットル目安',
        priority: 'essential',
      },
      {
        name: '非常食（3日分）',
        description: '米、パン、缶詰、レトルト食品など',
        priority: 'essential',
      },
      {
        name: '缶切り・栓抜き',
        description: '缶詰開封用',
        priority: 'essential',
      },
      {
        name: '割り箸・プラスチック食器',
        description: '食事用具',
        priority: 'recommended',
      },
      {
        name: 'ラップ・アルミホイル',
        description: '食器代用、保存用',
        priority: 'recommended',
      },
      {
        name: '調味料（塩・砂糖）',
        description: '味付け用',
        priority: 'recommended',
      },
    ],
  },
  {
    title: '衣類・寝具',
    items: [
      {
        name: '着替え（3日分）',
        description: '下着、靴下、上着など',
        priority: 'essential',
      },
      {
        name: '毛布・寝袋',
        description: '防寒・睡眠用',
        priority: 'essential',
      },
      {
        name: '防寒着',
        description: 'ジャケット、セーターなど',
        priority: 'essential',
      },
      {
        name: '雨具',
        description: 'レインコート、傘など',
        priority: 'recommended',
      },
      {
        name: '靴・スリッパ',
        description: '履き替え用',
        priority: 'recommended',
      },
      {
        name: 'タオル（複数枚）',
        description: '身体拭き、洗濯用',
        priority: 'recommended',
      },
    ],
  },
  {
    title: '衛生・清潔用品',
    items: [
      {
        name: '石鹸・ボディソープ',
        description: '身体洗浄用',
        priority: 'essential',
      },
      {
        name: '歯ブラシ・歯磨き粉',
        description: '口腔衛生用',
        priority: 'essential',
      },
      {
        name: 'シャンプー・リンス',
        description: '頭髪洗浄用',
        priority: 'essential',
      },
      {
        name: 'トイレットペーパー',
        description: '衛生用品',
        priority: 'essential',
      },
      {
        name: '生理用品',
        description: '女性用衛生用品',
        priority: 'essential',
      },
      {
        name: '大人用おむつ',
        description: '高齢者・介護用',
        priority: 'recommended',
      },
      {
        name: '除菌ウェットティッシュ',
        description: '清拭・消毒用',
        priority: 'recommended',
      },
      {
        name: '洗濯用洗剤',
        description: '衣類洗濯用',
        priority: 'recommended',
      },
    ],
  },
  {
    title: '生活用品・道具',
    items: [
      {
        name: 'ガムテープ',
        description: '補修・固定用',
        priority: 'essential',
      },
      {
        name: 'ロープ・ひも',
        description: '固定・結束用',
        priority: 'essential',
      },
      {
        name: 'カセットコンロ・ガスボンベ',
        description: '調理・暖房用',
        priority: 'essential',
      },
      {
        name: 'バケツ',
        description: '水運び・洗濯用',
        priority: 'recommended',
      },
      {
        name: '洗濯ばさみ',
        description: '洗濯物干し用',
        priority: 'recommended',
      },
      {
        name: 'ナイフ・はさみ',
        description: '調理・作業用',
        priority: 'recommended',
      },
      {
        name: 'ろうそく・ライター',
        description: '照明・点火用',
        priority: 'recommended',
      },
      {
        name: '新聞紙',
        description: '防寒・緩衝材用',
        priority: 'recommended',
      },
    ],
  },
  {
    title: '医薬品・健康管理',
    items: [
      {
        name: '救急箱（充実版）',
        description: '包帯、消毒液、湿布など',
        priority: 'essential',
      },
      {
        name: '常備薬（多めに）',
        description: '持病薬、風邪薬、胃腸薬など',
        priority: 'essential',
      },
      { name: '体温計', description: '健康管理用', priority: 'essential' },
      { name: '血圧計', description: '高血圧の方用', priority: 'recommended' },
      {
        name: 'マスク（多めに）',
        description: '感染症予防用',
        priority: 'recommended',
      },
      {
        name: '消毒用アルコール',
        description: '手指消毒用',
        priority: 'recommended',
      },
    ],
  },
  {
    title: '特別なニーズ',
    items: [
      {
        name: '粉ミルク・哺乳瓶',
        description: '乳児用',
        priority: 'essential',
      },
      {
        name: 'おむつ・おしりふき',
        description: '乳幼児用',
        priority: 'essential',
      },
      { name: '離乳食', description: '乳幼児用', priority: 'essential' },
      {
        name: 'ペット用品',
        description: 'フード、リード、ケージなど',
        priority: 'recommended',
      },
      {
        name: '老眼鏡・補聴器',
        description: '高齢者用',
        priority: 'recommended',
      },
      {
        name: '車椅子・歩行器',
        description: '身体不自由者用',
        priority: 'recommended',
      },
    ],
  },
];

export default function SecondaryEvacuationItems() {
  return (
    <div>
      <div className='text-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>
          二次避難の持ち物リスト
        </h2>
        <p className='text-gray-600'>避難所での長期生活に備えた生活必需品</p>
      </div>

      {/* 袋情報 */}
      <BagInfoSection evacuationLevel='secondary' />

      {/* 登録済みアイテム */}
      <div className='mb-8'>
        <RegisteredItems evacuationLevel='secondary' />
      </div>

      {/* 推奨アイテムリスト */}
      <div className='mb-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-2 text-center'>
          推奨アイテムリスト
        </h3>
        <p className='text-gray-600 text-center mb-6'>
          一般的に推奨される二次避難用のアイテムです。参考にして備蓄品を登録してください。
        </p>
      </div>

      <div className='space-y-6'>
        {secondaryEvacuationData.map((category, index) => (
          <div key={index} className='border border-gray-200 rounded-lg p-4'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
              {category.title}
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`p-3 rounded-md border-l-4 ${
                    item.priority === 'essential'
                      ? 'bg-gray-50 border-gray-400'
                      : 'bg-gray-100 border-gray-400'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900 mb-1'>
                        {item.name}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {item.description}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        item.priority === 'essential'
                          ? 'bg-blue-100 text-gray-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {item.priority === 'essential' ? '必須' : '推奨'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4'>
        <h4 className='font-semibold text-gray-900 mb-2'>
          二次避難時の準備のポイント
        </h4>
        <ul className='text-gray-800 text-sm space-y-1'>
          <li>• 車での避難が可能な場合は、より多くの物品を持参できます</li>
          <li>• 避難所の設備状況を事前に確認し、不足品を補完</li>
          <li>• 家族構成に応じて必要な物品をカスタマイズ</li>
          <li>• 季節に応じた衣類や防寒具を準備</li>
          <li>• 長期保存可能な食品を中心に備蓄</li>
        </ul>
      </div>

      <div className='mt-4 bg-gray-100 border border-gray-200 rounded-lg p-4'>
        <h4 className='font-semibold text-gray-900 mb-2'>
          持参リストの作成方法
        </h4>
        <ul className='text-gray-800 text-sm space-y-1'>
          <li>• 家族構成と特別なニーズを考慮してリストを作成</li>
          <li>• 重要度順に優先順位をつける</li>
          <li>• 定期的にリストを見直し、更新する</li>
          <li>• 実際に荷造りして重量や容量を確認</li>
        </ul>
      </div>
    </div>
  );
}
