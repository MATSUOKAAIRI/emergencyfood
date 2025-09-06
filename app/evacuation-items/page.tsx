import { Metadata } from 'next';
import EvacuationItemsClient from './EvacuationItemsClient';

export const metadata: Metadata = {
  title: '避難用持ち物リスト | Emergency Food',
  description: '一次避難・二次避難に必要な持ち物リストを確認できます',
};

export default function EvacuationItemsPage() {
  return <EvacuationItemsClient />;
}
