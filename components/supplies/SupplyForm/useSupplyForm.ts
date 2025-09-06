// components/supplies/SupplyForm/useSupplyForm.ts
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';
import { db } from '@/utils/firebase';
import type { SupplyFormData, UseSupplyFormProps } from './types';

export function useSupplyForm({
  uid,
  teamId,
  mode,
  supplyId,
  initialData,
}: UseSupplyFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SupplyFormData>(
    initialData || getInitialFormData()
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'quantity' ? Number(value) : value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!uid || !teamId) {
        setErrorMessage(ERROR_MESSAGES.FAMILY_GROUP_ID_MISSING);
        return;
      }

      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const supplyData = {
          ...formData,
          uid,
          teamId,
          createdAt: mode === 'add' ? serverTimestamp() : undefined,
          updatedAt: serverTimestamp(),
        };

        if (mode === 'edit' && supplyId) {
          await updateDoc(doc(db, 'supplies', supplyId), supplyData);
          setSuccessMessage(SUCCESS_MESSAGES.FOOD_UPDATED);
        } else {
          await addDoc(collection(db, 'supplies'), supplyData);
          setSuccessMessage(SUCCESS_MESSAGES.FOOD_CREATED);
        }

        setTimeout(() => {
          router.push(`/supplies/list?teamId=${teamId}`);
        }, 1500);
      } catch (error) {
        console.error('Supply operation error:', error);
        setErrorMessage(
          mode === 'edit'
            ? ERROR_MESSAGES.FOOD_UPDATE_FAILED
            : ERROR_MESSAGES.FOOD_CREATE_FAILED
        );
      } finally {
        setLoading(false);
      }
    },
    [uid, teamId, formData, mode, supplyId, router]
  );

  return {
    formData,
    errorMessage,
    successMessage,
    loading,
    handleChange,
    handleSubmit,
  };
}

function getInitialFormData(): SupplyFormData {
  return {
    name: '',
    quantity: 1,
    expiryDate: '',
    category: '',
    unit: '',
    evacuationLevel: '',
    amount: undefined,
    purchaseLocation: undefined,
    label: undefined,
    storageLocation: undefined,
  };
}
