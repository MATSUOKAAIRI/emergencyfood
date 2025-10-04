'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks';
import { useTeam } from '@/hooks/team/useTeam';
import type { Review } from '@/types';
import { ERROR_MESSAGES, UI_CONSTANTS } from '@/utils/constants';

export default function ReviewsClient() {
  const { supplyId } = useParams();
  const { user, loading } = useAuth(true);
  const { currentTeamId } = useTeam(user);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchReviews = async () => {
    if (!supplyId || !currentTeamId || !user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/event/supplies/${supplyId}/reviews?teamId=${currentTeamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [supplyId, currentTeamId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !user?.email) {
      setError(ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/event/supplies/${supplyId}/reviews?teamId=${currentTeamId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: reviewText,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '感想の投稿に失敗しました');
      }

      setReviewText('');
      // レビュー一覧を再取得
      fetchReviews();
    } catch (error: unknown) {
      console.error('Review submission error:', error);
      setError(
        error instanceof Error ? error.message : '感想の投稿に失敗しました。'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !currentTeamId || !reviewToDelete) return;

    setDeletingReviewId(reviewToDelete);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/event/supplies/${supplyId}/reviews?reviewId=${reviewToDelete}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '削除に失敗しました');
      }

      // レビュー一覧を再取得
      fetchReviews();
    } catch (error: unknown) {
      console.error('Review deletion error:', error);
      setError(
        error instanceof Error ? error.message : '感想の削除に失敗しました。'
      );
    } finally {
      setDeletingReviewId(null);
      setReviewToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteCancel = () => {
    setReviewToDelete(null);
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800' />
      </div>
    );
  }

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) {
      return '日時情報がありません';
    }

    let date: Date;

    // Firestore Timestamp形式の場合
    if (
      typeof timestamp === 'object' &&
      timestamp !== null &&
      (('seconds' in timestamp && typeof timestamp.seconds === 'number') ||
        ('_seconds' in timestamp && typeof timestamp._seconds === 'number'))
    ) {
      const seconds = (timestamp as any).seconds || (timestamp as any)._seconds;
      date = new Date(seconds * 1000);
    }
    // ISO文字列またはDate文字列の場合
    else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    }
    // Dateオブジェクトの場合
    else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '日時情報がありません';
    }

    // 有効な日付かチェック
    if (isNaN(date.getTime())) {
      return '日時情報がありません';
    }

    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      {error && (
        <div className='mb-6 bg-gray-100 border border-gray-300 rounded-lg p-4'>
          <p className='text-sm text-gray-800'>{error}</p>
        </div>
      )}

      {user && (
        <div className='bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 shadow-lg'>
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              感想を投稿する
            </h3>
          </div>

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <textarea
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 resize-none'
                id='reviewText'
                placeholder='この備蓄品についての感想を書いてください...'
                rows={4}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
            </div>
            <div className='flex justify-end'>
              <button
                className='bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
                disabled={submitting}
                type='submit'
              >
                {submitting ? '投稿中...' : '感想を投稿'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!user && (
        <div className='bg-gray-100 border border-gray-300 rounded-lg p-6 mb-8'>
          <p className='text-sm text-gray-800'>
            {UI_CONSTANTS.LOGIN_REQUIRED_FOR_REVIEW}
          </p>
        </div>
      )}

      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>
            投稿された感想
          </h2>
          {reviews.length > 0 && (
            <span className='bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium'>
              {reviews.length}件
            </span>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className='space-y-4'>
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    <p className='font-semibold text-gray-900'>
                      名前：{review.userName}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  {user && review.userId === user.uid && (
                    <button
                      onClick={() => handleDeleteClick(review.id)}
                      disabled={deletingReviewId === review.id}
                      className='text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium'
                    >
                      {deletingReviewId === review.id ? '削除中...' : '削除'}
                    </button>
                  )}
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                    {review.content || review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-12 bg-gray-50 rounded-xl border border-gray-300'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              感想がありません
            </h3>
          </div>
        )}
      </div>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        title='感想を削除しますか？'
        size='sm'
      >
        <div className='space-y-4'>
          <p className='text-gray-600'>この操作は取り消すことができません。</p>
          <div className='flex justify-end space-x-3'>
            <button
              onClick={handleDeleteCancel}
              disabled={deletingReviewId === reviewToDelete}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              キャンセル
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deletingReviewId === reviewToDelete}
              className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {deletingReviewId === reviewToDelete ? '削除中...' : '削除する'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
