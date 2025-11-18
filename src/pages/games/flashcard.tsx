/**
 * Flashcard 单词卡片翻转游戏页面
 * 支持点击翻转、键盘快捷键、进度管理、多种显示模式
 */

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle';
import FlashCard from '@/components/FlashCard';
import { useFlashcardProgress } from '@/hooks/useFlashcardProgress';

export default function FlashcardGame() {
  const {
    config,
    stats,
    currentCard,
    currentIndex,
    totalCards,
    isFlipped,
    isLoading,
    toggleMode,
    toggleShuffle,
    flipCard,
    markAsNeedReview,
    markAsMastered,
    nextCard,
    previousCard,
    resetProgress,
  } = useFlashcardProgress();

  const [showConfigMenu, setShowConfigMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ==================== 键盘快捷键 ====================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在显示确认对话框，忽略快捷键
      if (showConfigMenu || showResetConfirm) return;

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          flipCard();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          markAsNeedReview();
          break;
        case 'ArrowRight':
          e.preventDefault();
          markAsMastered();
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextCard();
          break;
        case 'ArrowUp':
          e.preventDefault();
          previousCard();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    flipCard,
    markAsNeedReview,
    markAsMastered,
    nextCard,
    previousCard,
    showConfigMenu,
    showResetConfirm,
  ]);

  // ==================== 处理重置进度 ====================

  const handleResetProgress = () => {
    resetProgress();
    setShowResetConfirm(false);
    setShowConfigMenu(false);
  };

  // ==================== 加载中状态 ====================

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">正在加载词库...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">正在加载所有单词数据</p>
        </div>
      </div>
    );
  }

  // ==================== 无数据状态 ====================

  if (!currentCard || totalCards === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <DarkModeToggle />
        <div className="text-center px-4">
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4">😕 没有找到单词数据</p>
          <Link
            href="/"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline"
          >
            返回主页
          </Link>
        </div>
      </div>
    );
  }

  // ==================== 主页面渲染 ====================

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 py-6 sm:py-12 px-4">
      {/* 暗黑模式切换 */}
      <DarkModeToggle />

      <div className="max-w-5xl mx-auto">
        {/* ==================== 顶部导航栏 ==================== */}
        <div className="flex items-center justify-between mb-6">
          {/* 返回按钮 */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <svg
              className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">返回主页</span>
            <span className="sm:hidden">返回</span>
          </Link>

          {/* 配置按钮 */}
          <button
            onClick={() => setShowConfigMenu(!showConfigMenu)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="设置"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* ==================== 配置菜单 ==================== */}
        {showConfigMenu && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-transparent dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">⚙️ 设置</h3>
            
            <div className="space-y-4">
              {/* 显示模式切换 */}
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">显示模式</span>
                <button
                  onClick={toggleMode}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  {config.mode === 'ja-to-zh' ? '🇯🇵 日语 → 中文' : '🇨🇳 中文 → 日语'}
                </button>
              </div>

              {/* 乱序开关 */}
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">乱序模式</span>
                <button
                  onClick={toggleShuffle}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    config.shuffled
                      ? 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {config.shuffled ? '🔀 已开启' : '📋 已关闭'}
                </button>
              </div>

              {/* 重置进度 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">重置学习进度</span>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  🗑️ 重置
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowConfigMenu(false)}
              className="mt-4 w-full py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        )}

        {/* ==================== 重置确认对话框 ==================== */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">⚠️ 确认重置</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                确定要重置所有学习进度吗？此操作不可撤销！
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleResetProgress}
                  className="flex-1 py-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  确认重置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 页面标题 ==================== */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-3">
            🎴 单词卡片
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            点击卡片翻转 · 使用快捷键提升效率
          </p>
        </div>

        {/* ==================== 统计信息 ==================== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-transparent dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.totalCards}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">总单词</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.masteredCards}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">已掌握</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.needReviewCards}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">需复习</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                {currentIndex + 1} / {totalCards}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">当前进度</div>
            </div>
          </div>
        </div>

        {/* ==================== 卡片展示区 ==================== */}
        <div className="mb-6">
          <FlashCard word={currentCard} mode={config.mode} isFlipped={isFlipped} onFlip={flipCard} />
        </div>

        {/* ==================== 底部操作按钮 ==================== */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <button
            onClick={markAsNeedReview}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            📝 需复习
          </button>
          <button
            onClick={nextCard}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            ⏭️ 下一个
          </button>
          <button
            onClick={markAsMastered}
            className="px-4 sm:px-6 py-3 sm:py-4 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            ✅ 已掌握
          </button>
        </div>

        {/* ==================== 键盘快捷键提示 ==================== */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-3">⌨️ 键盘快捷键</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">
                Space
              </kbd>
              <span>翻转卡片</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">
                ←
              </kbd>
              <span>标记需复习</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">
                →
              </kbd>
              <span>标记已掌握</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">
                ↓
              </kbd>
              <span>下一个单词</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

