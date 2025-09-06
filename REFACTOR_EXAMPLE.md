# Next.js App Router 理想的な構造

## ❌ 現在の問題のある構造

```
app/supplies/add/
├── page.tsx (Server) - 単純な委譲のみ
└── SupplyAddClient.tsx (Client) - ビジネスロジック

components/supplies/
└── SupplyForm.tsx - ページ固有ロジック + UI
```

## ✅ 改善後の理想的な構造

```
app/supplies/add/
├── page.tsx (Server) - メタデータ + レイアウト
└── SupplyAddForm.tsx (Client) - ページ固有ロジック

components/ui/
├── Input.tsx - 汎用入力コンポーネント
├── Select.tsx - 汎用選択コンポーネント
├── Button.tsx - 汎用ボタン
└── FormField.tsx - 汎用フォームフィールド
```

## 具体的な実装例

### app/supplies/add/page.tsx (Server Component)

```typescript
import type { Metadata } from 'next';
import { SupplyAddForm } from './SupplyAddForm';

export const metadata: Metadata = {
  title: '備蓄品追加 - SonaBase',
  description: '新しい備蓄品を登録します',
};

export default function SupplyAddPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        新しい備蓄品を登録
      </h1>
      <SupplyAddForm />
    </div>
  );
}
```

### app/supplies/add/SupplyAddForm.tsx (Client Component)

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useTeam } from '@/hooks';
import { Input, Select, Button, FormField } from '@/components/ui';

export function SupplyAddForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTeamId } = useTeam(user);
  const [formData, setFormData] = useState(getInitialData());

  // ページ固有のロジック
  const handleSubmit = async (e: React.FormEvent) => {
    // Firebase操作
    // ナビゲーション
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="備蓄品名">
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </FormField>

      <FormField label="カテゴリ">
        <Select
          value={formData.category}
          options={FOOD_CATEGORIES}
          onChange={(value) => setFormData({...formData, category: value})}
        />
      </FormField>

      <Button type="submit">登録</Button>
    </form>
  );
}
```

### components/ui/Input.tsx (汎用コンポーネント)

```typescript
interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}

export function Input({ value, onChange, ...props }: InputProps) {
  return (
    <input
      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}
```

## メリット

1. **明確な責任分離**
   - app/ = ページ固有ロジック
   - components/ = 再利用可能UI

2. **Server Components活用**
   - メタデータ、SEO対応
   - 初期データフェッチ

3. **保守性向上**
   - コンポーネントの再利用性
   - テストのしやすさ

4. **Next.js最適化**
   - バンドルサイズ削減
   - パフォーマンス向上
