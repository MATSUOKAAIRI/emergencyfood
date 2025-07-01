'use client';
import { useState } from 'react';

import { useAuth } from '@/hooks';
import type { AppUser } from '@/types';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONSTANTS,
} from '@/utils/constants';

interface AccountSettingsProps {
  user: AppUser;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const { updateUserName, changePassword } = useAuth();

  const getDisplayName = () => {
    return user.displayName || user.email;
  };

  const getEditDisplayName = () => {
    return user.displayName || '';
  };

  const [displayName, setDisplayName] = useState(getEditDisplayName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleNameSave = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: '名前を入力してください' });
      return;
    }

    setLoading(true);
    try {
      await updateUserName(displayName.trim());
      setIsEditingName(false);
      setMessage({ type: 'success', text: SUCCESS_MESSAGES.NAME_UPDATED });
    } catch (error) {
      setMessage({ type: 'error', text: ERROR_MESSAGES.NAME_UPDATE_FAILED });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'パスワードは6文字以上にしてください',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードが一致しません' });
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: SUCCESS_MESSAGES.PASSWORD_CHANGED });
    } catch (error) {
      setMessage({
        type: 'error',
        text: ERROR_MESSAGES.PASSWORD_CHANGE_FAILED,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>
        {UI_CONSTANTS.ACCOUNT_SETTINGS}
      </h2>

      {message && (
        <div
          className={`p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-200 text-black border'
              : 'bg-red-200 text-black border'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-900'>
          {UI_CONSTANTS.ACCOUNT_NAME}
        </label>
        {isEditingName ? (
          <div className='flex gap-2'>
            <input
              type='text'
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className='flex-1 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black'
              placeholder='アカウント名を入力'
            />
            <button
              onClick={handleNameSave}
              disabled={loading}
              className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors'
            >
              {loading ? UI_CONSTANTS.PROCESSING : UI_CONSTANTS.SAVE}
            </button>
            <button
              onClick={() => {
                setIsEditingName(false);
                setDisplayName(getEditDisplayName());
              }}
              className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors'
            >
              {UI_CONSTANTS.CANCEL}
            </button>
          </div>
        ) : (
          <div className='flex items-center justify-between p-3 bg-gray-100 rounded-md border border-gray-300'>
            <span className='text-gray-900'>{getDisplayName()}</span>
            <button
              onClick={() => setIsEditingName(true)}
              className='text-black hover:text-gray-600 text-sm font-medium transition-colors'
            >
              {UI_CONSTANTS.EDIT}
            </button>
          </div>
        )}
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-900'>
          {UI_CONSTANTS.EMAIL_ADDRESS}
        </label>
        <div className='p-3 bg-gray-100 rounded-md border border-gray-300'>
          <span className='text-gray-900'>{user.email}</span>
        </div>
      </div>

      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-900'>
          {UI_CONSTANTS.CHANGE_PASSWORD}
        </label>
        {isChangingPassword ? (
          <div className='space-y-3'>
            <input
              type='password'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black'
              placeholder='新しいパスワード（6文字以上）'
            />
            <input
              type='password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className='w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black'
              placeholder='新しいパスワード（確認）'
            />
            <div className='flex gap-2'>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors'
              >
                {loading ? UI_CONSTANTS.PROCESSING : UI_CONSTANTS.SAVE}
              </button>
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors'
              >
                {UI_CONSTANTS.CANCEL}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChangingPassword(true)}
            className='px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors'
          >
            {UI_CONSTANTS.CHANGE_PASSWORD}
          </button>
        )}
      </div>
    </div>
  );
}
