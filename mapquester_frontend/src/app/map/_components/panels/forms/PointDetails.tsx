import { FC, useState, useEffect, useRef } from 'react';
import { Point } from '@/app/utils/types';
import { capitalize, getRelativeTime } from '@/app/utils/fns';
import { useRecoilValue } from 'recoil';
import { authState } from '@/app/atoms/authState';
import apiClient from '@/app/api/axios';
import { tagToColorMapping } from '@/app/utils/data';
import { ReactionUser } from '@/app/utils/types';

interface PointDetailsProps {
  feed?: boolean;
  point: Point;
  onClose: () => void;
  setShowReactionModal: (show: boolean) => void;
  setReactionUsers: (users: ReactionUser[]) => void;
}

interface Interaction {
  id: string;
  userId: string;
  interactionType: 'reaction' | 'comment';
  content: string;
  createdAt: string;
  updatedAt: string;
  username: string;
}


const PointDetails: FC<PointDetailsProps> = ({
  feed,
  point,
  onClose,
  setShowReactionModal,
  setReactionUsers
}) => {
  const auth = useRecoilValue(authState);
  const [comment, setComment] = useState('');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [hasReacted, setHasReacted] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();

  console.log("auth: ", auth);

  useEffect(() => {
    fetchInteractions();
  }, [point.id]);

  const fetchInteractions = async () => {
    try {
      const response = await apiClient.get(`/api/v1/pois/interactions/${point.id}/`);
      setInteractions(response.data);
      const t_authId = auth.id;
      const t_userId = response.data.map((i: Interaction) => i.userId);
      console.log("t_authId: ", t_authId);
      console.log("t_userId: ", t_userId); 
      console.log(t_authId === t_userId[0]);
      setHasReacted(response.data.some((i: Interaction) => 
        String(i.userId) === String(auth.id) && i.interactionType === 'reaction'
      ));
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const handleReaction = async () => {
    console.log("authId: ", auth.id);
    console.log("poiId: ", point.id);
    try {
      await apiClient.post('/api/v1/pois/interactions/create/', {
        userId: auth.id,
        poiId: point.id,
        interactionType: 'reaction',
      });
      fetchInteractions();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleReactionPress = () => {
    longPressTimer.current = setTimeout(() => {
      const reactionData = interactions
        .filter(i => i.interactionType === 'reaction')
        .map(i => ({
            id: i.userId,
            username: i.username,
            createdAt: i.createdAt
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setReactionUsers(reactionData);
      setShowReactionModal(true);
    }, 500);
  };

  const handleReactionRelease = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await apiClient.post('/api/v1/pois/interactions/create/', {
        userId: auth.id,
        poiId: point.id,
        interactionType: 'comment',
        content: comment
      });
      setComment('');
      fetchInteractions();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const reactionCount = () => 
    interactions.filter(i => i.interactionType === 'reaction').length;

  return (
    <div className="flex flex-col h-[450px]">
      {/* Fixed Header Section */}
      <div className="p-2">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          &times;
        </button>
        
        <div className="space-y-2">
          <div className='flex space-x-2 items-center'>
            <h3 className="text-xl font-semibold text-gray-800">{point.title}</h3>
            <span
              className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white"
              style={{
                backgroundColor: tagToColorMapping[point.tag],
              }}
            >
              {capitalize(point.tag)}
            </span>
          </div>
          {feed && <p className="italic text-sm text-gray-600">
            Author:&nbsp;
            <a 
              href={`/profile/${point.user_id}`} 
              className="text-blue-500 hover:underline"
            >
              {point.user}
            </a>
          </p>}
          <p className="text-gray-800">{point.description}</p>
          {feed && (
            <>
              <hr className="my-2" />
              <p className="italic text-sm text-gray-600">
                {getRelativeTime(point.created_at!)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Scrollable Comments Section */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-3">
          {interactions
            .filter(i => i.interactionType === 'comment')
            .map(comment => (
              <div key={comment.id} className="bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium">{comment.username}</span>
            <span className="italic text-sm text-gray-600">
              {getRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-800">{comment.content}</p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="border-t space-y-4 bg-white p-2">
        {/* Reactions Section */}
        <div className="flex justify-start">
          <button
            onClick={handleReaction}
            onMouseDown={handleReactionPress}
            onMouseUp={handleReactionRelease}
            onTouchStart={handleReactionPress}
            onTouchEnd={handleReactionRelease}
            className="flex items-center space-x-1"
          >
            <span className={hasReacted ? 'text-red-500' : 'text-gray-400'}>
              {hasReacted ? '❤️' : '♡'}
            </span>
            <span className="text-sm text-gray-500">{reactionCount()}</span>
          </button>
        </div>

        <form onSubmit={handleComment} className="flex space-x-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C91C1C]"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-[#C91C1C] text-white rounded-lg hover:bg-red-700"
          >
            &gt;
          </button>
        </form>
      </div>
    </div>
  );
};

export default PointDetails;
