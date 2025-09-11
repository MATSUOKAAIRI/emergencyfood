'use client';
import { useEffect, useState } from 'react';

import { useEventAuth } from '@/hooks/event/useEventAuth';

interface Review {
  id: string;
  supplyId: string;
  teamId: string;
  content: string;
  userName: string;
  createdAt: unknown;
}

interface EventReviewsClientProps {
  supplyId: string;
}

export default function EventReviewsClient({
  supplyId,
}: EventReviewsClientProps) {
  const { eventUser } = useEventAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsResponse = await fetch(
          `/api/event/supplies/${supplyId}/reviews?teamId=giikuHaku-2025`
        );
        const reviewsData = await reviewsResponse.json();

        if (!reviewsResponse.ok) {
          throw new Error(reviewsData.error || 'レビューの取得に失敗しました');
        }

        setReviews(reviewsData.reviews);
      } catch (_error: unknown) {
        const errorMessage =
          _error instanceof Error
            ? _error.message
            : 'レビューの取得に失敗しました';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [supplyId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    if (!eventUser) {
      setSubmitError(
        'イベントセッションが見つかりません。再度参加してください。'
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        `/api/event/supplies/${supplyId}/reviews?teamId=giikuHaku-2025`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newReview,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'レビューの投稿に失敗しました');
      }

      const newReviewObj = {
        id: result.reviewId,
        supplyId,
        teamId: 'giikuHaku-2025',
        content: newReview,
        userName: 'イベント参加者',
        createdAt: new Date(),
      };

      setReviews(prev => [newReviewObj, ...prev]);
      setNewReview('');
    } catch (_error: unknown) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : 'レビューの投稿に失敗しました';
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (
      !timestamp ||
      typeof timestamp !== 'object' ||
      !('seconds' in timestamp) ||
      typeof (timestamp as { seconds: unknown }).seconds !== 'number'
    ) {
      return '日時情報がありません';
    }
    const date = new Date((timestamp as { seconds: number }).seconds * 1000);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800' />
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      {submitError && (
        <div className='mb-6 bg-gray-100 border border-gray-300 rounded-lg p-4'>
          <p className='text-sm text-gray-800'>{submitError}</p>
        </div>
      )}

      {eventUser && (
        <div className='bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 shadow-lg'>
          <div className='mb-4'>
            <h3 className='text-lg font-semibold text-gray-900'>
              感想を投稿する
            </h3>
          </div>

          <form className='space-y-4' onSubmit={handleSubmitReview}>
            <div>
              <textarea
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 resize-none'
                id='reviewText'
                placeholder='この備蓄品についての感想を書いてください...'
                rows={4}
                value={newReview}
                onChange={e => setNewReview(e.target.value)}
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

      {!eventUser && (
        <div className='bg-gray-100 border border-gray-300 rounded-lg p-6 mb-8'>
          <p className='text-sm text-gray-800'>
            イベントに参加してから感想を投稿できます
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
                </div>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                    {review.content}
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
    </div>
  );
}
