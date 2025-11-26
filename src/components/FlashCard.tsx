/**
 * FlashCard 3D 翻转卡片组件
 * 支持点击翻转、语音朗读、响应式设计
 */

import { useState } from 'react';
import { speechService } from '@/utils/speechService';
import type { DisplayMode, CardStatus } from '@/utils/flashcardStorage';

// ==================== 类型定义 ====================

interface Word {
  日汉字: string;
  平假名: string;
  中文: string;
}

interface FlashCardProps {
  word: Word;
  mode: DisplayMode;
  isFlipped: boolean;
  onFlip: () => void;
  cardStatus?: CardStatus | null;
}

// ==================== 主组件 ====================

export default function FlashCard({ word, mode, isFlipped, onFlip, cardStatus }: FlashCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ==================== 状态徽章 ====================

  const StatusBadge = () => {
    if (!cardStatus || cardStatus === 'learning') return null;

    const badgeConfig = {
      mastered: {
        bg: 'bg-green-500 dark:bg-green-600',
        text: 'text-white',
        icon: '✅',
        label: '已掌握',
      },
      need_review: {
        bg: 'bg-orange-500 dark:bg-orange-600',
        text: 'text-white',
        icon: '📝',
        label: '需复习',
      },
    };

    const config = badgeConfig[cardStatus];
    if (!config) return null;

    return (
      <div className={`absolute top-4 left-4 ${config.bg} ${config.text} px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1.5 z-10`}>
        <span>{config.icon}</span>
        <span className="hidden sm:inline">{config.label}</span>
      </div>
    );
  };

  // ==================== 语音朗读 ====================

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发翻转

    const textToSpeak = word.平假名 || word.日汉字;

    const success = await speechService.speak(textToSpeak, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (error) => {
        setIsSpeaking(false);
        console.error('语音播放失败:', error);
      },
    });

    if (!success) {
      setIsSpeaking(false);
    }
  };

  // ==================== 渲染内容 ====================

  // 正面内容
  const frontContent = mode === 'ja-to-zh' ? (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800 dark:text-white mb-4">
        {word.日汉字}
      </div>
      <div className="text-xl sm:text-2xl text-purple-600 dark:text-purple-400">
        {word.平假名}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-white">
        {word.中文}
      </div>
    </div>
  );

  // 背面内容
  const backContent = mode === 'ja-to-zh' ? (
    <div className="flex flex-col items-center justify-center h-full p-8 relative">
      {/* 语音按钮 */}
      <button
        onClick={handleSpeak}
        disabled={isSpeaking}
        className="absolute top-4 right-4 p-3 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        title="朗读单词"
      >
        {isSpeaking ? (
          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* 中文含义 */}
      <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">
        {word.中文}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full p-8 relative">
      {/* 语音按钮 */}
      <button
        onClick={handleSpeak}
        disabled={isSpeaking}
        className="absolute top-4 right-4 p-3 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        title="朗读单词"
      >
        {isSpeaking ? (
          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* 日语内容 */}
      <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800 dark:text-white mb-4">
        {word.日汉字}
      </div>
      <div className="text-2xl sm:text-3xl text-purple-600 dark:text-purple-400">
        {word.平假名}
      </div>
    </div>
  );

  // ==================== 渲染 ====================

  return (
    <div className="perspective-container w-full max-w-2xl mx-auto">
      {/* 3D 翻转容器 */}
      <div
        className={`flip-card ${isFlipped ? 'flipped' : ''}`}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip();
          }
        }}
      >
        {/* 卡片内部容器 */}
        <div className="flip-card-inner">
          {/* 正面 */}
          <div className="flip-card-front bg-white dark:bg-gray-800 border-4 border-indigo-200 dark:border-indigo-700 relative">
            <StatusBadge />
            {frontContent}
            {/* 提示文字 */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                点击翻转查看答案
              </p>
            </div>
          </div>

          {/* 背面 */}
          <div className="flip-card-back bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-4 border-indigo-300 dark:border-indigo-600">
            {backContent}
          </div>
        </div>
      </div>

      {/* 样式定义 */}
      <style jsx>{`
        .perspective-container {
          perspective: 1000px;
        }

        .flip-card {
          position: relative;
          width: 100%;
          height: 400px;
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .flip-card:hover {
          transform: scale(1.02);
        }

        .flip-card:active {
          transform: scale(0.98);
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }

        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        @media (max-width: 640px) {
          .flip-card {
            height: 350px;
          }
        }

        @media (min-width: 768px) {
          .flip-card {
            height: 450px;
          }
        }
      `}</style>
    </div>
  );
}

