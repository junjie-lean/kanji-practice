/**
 * Flashcard 进度管理 Hook
 * 管理单词卡片的学习状态、进度和交互逻辑
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { VOCABULARY_BOOKS, loadVocabularyBook } from '@/data/config';
import {
  getConfig,
  saveConfig,
  getProgress,
  saveProgress,
  getStats,
  clearAllProgress,
  updateProgress,
  type FlashcardConfig,
  type FlashcardStats,
  type DisplayMode,
  type CardStatus,
} from '@/utils/flashcardStorage';

// ==================== 类型定义 ====================

interface Word {
  日汉字: string;
  平假名: string;
  中文: string;
}

export interface WordWithId extends Word {
  id: string;
  bookId: string;
  bookTitle: string;
}

export interface UseFlashcardProgressReturn {
  // 数据状态
  config: FlashcardConfig;
  stats: FlashcardStats;
  currentCard: WordWithId | null;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  isLoading: boolean;
  isTransitioning: boolean;

  // 操作函数
  toggleMode: () => void;
  toggleShuffle: () => void;
  flipCard: () => void;
  markAsNeedReview: () => void;
  markAsMastered: () => void;
  nextCard: () => void;
  previousCard: () => void;
  resetProgress: () => void;
  goToCard: (index: number) => void;
  getCardStatus: (wordId: string) => CardStatus | null;
}

// ==================== Fisher-Yates 洗牌算法 ====================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ==================== 主 Hook ====================

export function useFlashcardProgress(): UseFlashcardProgressReturn {
  const [config, setConfig] = useState<FlashcardConfig>(() => getConfig());
  const [allWords, setAllWords] = useState<WordWithId[]>([]);
  const [displayWords, setDisplayWords] = useState<WordWithId[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== 加载所有词库 ====================

  useEffect(() => {
    const loadAllVocabulary = async () => {
      setIsLoading(true);
      const loadedWords: WordWithId[] = [];

      for (const book of VOCABULARY_BOOKS) {
        try {
          const words = await loadVocabularyBook(book.filename);
          if (words && Array.isArray(words)) {
            words.forEach((word: Word, index: number) => {
              loadedWords.push({
                ...word,
                id: `${book.id}_${index}`,
                bookId: book.id,
                bookTitle: book.title,
              });
            });
          }
        } catch (error) {
          console.error(`Failed to load vocabulary book: ${book.filename}`, error);
        }
      }

      setAllWords(loadedWords);
      setIsLoading(false);
    };

    loadAllVocabulary();
  }, []);

  // ==================== 智能排序：已掌握的单词放到末尾 ====================

  const sortedWords = useMemo(() => {
    if (allWords.length === 0) return [];

    // 将单词分为三组：需复习、学习中、已掌握
    const needReview: WordWithId[] = [];
    const learning: WordWithId[] = [];
    const mastered: WordWithId[] = [];

    allWords.forEach((word) => {
      const progress = getProgress(word.id);
      if (!progress || progress.status === 'learning') {
        learning.push(word);
      } else if (progress.status === 'need_review') {
        needReview.push(word);
      } else if (progress.status === 'mastered') {
        mastered.push(word);
      }
    });

    // 优先级：需复习 > 学习中 > 已掌握
    return [...needReview, ...learning, ...mastered];
  }, [allWords]);

  // ==================== 应用乱序配置 ====================

  useEffect(() => {
    if (sortedWords.length === 0) return;

    if (config.shuffled) {
      setDisplayWords(shuffleArray(sortedWords));
    } else {
      setDisplayWords(sortedWords);
    }
    
    // 重置到第一张卡片
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [sortedWords, config.shuffled]);

  // ==================== 计算统计数据 ====================

  const stats = useMemo(() => {
    return getStats(allWords.length);
  }, [allWords.length, displayWords]); // displayWords 变化时重新计算

  // ==================== 当前卡片 ====================

  const currentCard = useMemo(() => {
    if (displayWords.length === 0) return null;
    return displayWords[currentIndex] || null;
  }, [displayWords, currentIndex]);

  // ==================== 配置切换函数 ====================

  const toggleMode = useCallback(() => {
    const newMode: DisplayMode = config.mode === 'ja-to-zh' ? 'zh-to-ja' : 'ja-to-zh';
    const newConfig = { ...config, mode: newMode };
    setConfig(newConfig);
    saveConfig(newConfig);
    setIsFlipped(false); // 切换模式时重置翻转状态
  }, [config]);

  const toggleShuffle = useCallback(() => {
    const newConfig = { ...config, shuffled: !config.shuffled };
    setConfig(newConfig);
    saveConfig(newConfig);
  }, [config]);

  // ==================== 卡片操作函数 ====================

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < displayWords.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [displayWords.length]);

  const nextCard = useCallback(() => {
    if (displayWords.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % displayWords.length;
    setCurrentIndex(nextIndex);
    setIsFlipped(false);
  }, [currentIndex, displayWords.length]);

  const previousCard = useCallback(() => {
    if (displayWords.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? displayWords.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setIsFlipped(false);
  }, [currentIndex, displayWords.length]);

  // ==================== 清理定时器 ====================

  const clearTransition = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setIsTransitioning(false);
  }, []);

  // ==================== 获取卡片状态 ====================

  const getCardStatus = useCallback((wordId: string): CardStatus | null => {
    const progress = getProgress(wordId);
    return progress ? progress.status : null;
  }, []);

  // ==================== 学习进度标记函数 ====================

  const markAsNeedReview = useCallback(() => {
    if (!currentCard) return;

    const existingProgress = getProgress(currentCard.id);
    const newProgress = updateProgress(existingProgress, 'need_review');
    saveProgress(currentCard.id, newProgress);

    // 设置过渡状态
    setIsTransitioning(true);
    
    // 清理之前的定时器
    clearTransition();
    
    // 延迟跳转到下一张（默认2秒）
    transitionTimeoutRef.current = setTimeout(() => {
      nextCard();
      setIsTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 2000);
  }, [currentCard, nextCard, clearTransition]);

  const markAsMastered = useCallback(() => {
    if (!currentCard) return;

    const existingProgress = getProgress(currentCard.id);
    const newProgress = updateProgress(existingProgress, 'mastered');
    saveProgress(currentCard.id, newProgress);

    // 设置过渡状态
    setIsTransitioning(true);
    
    // 清理之前的定时器
    clearTransition();
    
    // 延迟跳转到下一张（默认2秒）
    transitionTimeoutRef.current = setTimeout(() => {
      nextCard();
      setIsTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 2000);
  }, [currentCard, nextCard, clearTransition]);

  // ==================== 清理效果 ====================

  useEffect(() => {
    return () => {
      clearTransition();
    };
  }, [clearTransition]);

  // ==================== 重置进度 ====================

  const resetProgress = useCallback(() => {
    clearAllProgress();
    // 触发重新排序
    setDisplayWords([...displayWords]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [displayWords]);

  // ==================== 返回值 ====================

  return {
    // 数据状态
    config,
    stats,
    currentCard,
    currentIndex,
    totalCards: displayWords.length,
    isFlipped,
    isLoading,
    isTransitioning,

    // 操作函数
    toggleMode,
    toggleShuffle,
    flipCard,
    markAsNeedReview,
    markAsMastered,
    nextCard,
    previousCard,
    resetProgress,
    goToCard,
    getCardStatus,
  };
}

