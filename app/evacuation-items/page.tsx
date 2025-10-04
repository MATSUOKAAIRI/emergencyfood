import { Metadata } from 'next';
import EvacuationItemsClient from './EvacuationItemsClient';

export const metadata: Metadata = {
  title: '避難用持ち物リスト | Emergency Food',
  description: '避難に必要な持ち物リストを確認',
};

export default function EvacuationItemsPage() {
  return <EvacuationItemsClient />;
}
