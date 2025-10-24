'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getBookById, loadVocabularyBook, type BookConfig } from '@/data/config';
import { speechService } from '@/utils/speechService';
import DarkModeToggle from '@/components/DarkModeToggle';

interface Word {
    日汉字: string;
    平假名: string;
    中文: string;
}

export default function PracticeLesson() {
    const router = useRouter();
    const { book: bookId } = router.query;

    const [bookConfig, setBookConfig] = useState<BookConfig | null>(null);
    const [vocabulary, setVocabulary] = useState<Word[]>([]);
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [practicedIndices, setPracticedIndices] = useState<Set<number>>(new Set());
    const [totalPracticeCount, setTotalPracticeCount] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isContentVisible, setIsContentVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 加载词库
    useEffect(() => {
        if (!bookId || typeof bookId !== 'string') return;

        const loadBook = async () => {
            setIsLoading(true);
            const config = getBookById(bookId);

            if (!config) {
                console.error('词库配置未找到:', bookId);
                setIsLoading(false);
                return;
            }

            setBookConfig(config);
            const words = await loadVocabularyBook(config.filename);

            if (words) {
                setVocabulary(words);
            }

            setIsLoading(false);
        };

        loadBook();
    }, [bookId]);

    // 简化后的随机选择单词算法
    const selectRandomWord = () => {
        if (vocabulary.length === 0) return null;

        const availableIndices: number[] = [];
        for (let i = 0; i < vocabulary.length; i++) {
            if (!practicedIndices.has(i)) {
                availableIndices.push(i);
            }
        }

        if (availableIndices.length === 0) {
            console.log('🎉 所有单词已练习完成！');
            return null;
        }

        const randomIndex = availableIndices[
            Math.floor(Math.random() * availableIndices.length)
        ];
        const selectedWord = vocabulary[randomIndex];

        setCurrentWord(selectedWord);
        setCurrentIndex(randomIndex);
        setIsContentVisible(false);

        setPracticedIndices(prev => {
            const newSet = new Set(prev);
            newSet.add(randomIndex);
            return newSet;
        });

        setTotalPracticeCount(prev => prev + 1);

        console.log(`✅ 选择单词 [${randomIndex}]: ${selectedWord.日汉字}`);
        console.log(`📊 已练习: ${practicedIndices.size + 1}/${vocabulary.length}`);
        console.log(`📈 剩余: ${availableIndices.length - 1} 个`);

        return selectedWord;
    };

    // 朗读单词
    const speakWord = async (word: Word) => {
        const textToSpeak = word.平假名 || word.日汉字;

        const success = await speechService.speak(
            textToSpeak,
            {
                onStart: () => setIsSpeaking(true),
                onEnd: () => setIsSpeaking(false),
                onError: (error) => {
                    setIsSpeaking(false);
                    console.error('播放失败:', error);
                }
            }
        );

        if (!success) {
            setIsSpeaking(false);
            console.error('语音播放失败');
        }
    };

    // 随机听写
    const handleRandomDictation = () => {
        const word = selectRandomWord();
        if (word) {
            speakWord(word);
        }
    };

    // 重新播放
    const handleReplay = () => {
        if (currentWord) {
            speakWord(currentWord);
        }
    };

    // 键盘快捷键监听
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 回车键：听写下一个单词
            if (e.key === 'Enter') {
                // 只在有可练习单词且不在朗读中时触发
                if (!isSpeaking && practicedIndices.size < vocabulary.length) {
                    e.preventDefault();
                    // 直接执行逻辑，避免依赖闭包
                    const word = selectRandomWord();
                    if (word) {
                        speakWord(word);
                    }
                }
            }

            // 空格键：按住查看答案
            if (e.key === ' ' || e.code === 'Space') {
                // 只在有当前单词且答案未显示时触发
                if (currentWord && !isContentVisible) {
                    e.preventDefault();
                    setIsContentVisible(true);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // 空格键：松开隐藏答案
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                setIsContentVisible(false);
            }
        };

        // 添加事件监听器
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // 清理事件监听器
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [currentWord, isSpeaking, practicedIndices.size, vocabulary.length, isContentVisible]);

    // 加载中
    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">加载词库中...</p>
                </div>
            </div>
        );
    }

    // 词库未找到
    if (!bookConfig || vocabulary.length === 0) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
                <div className="text-center px-4">
                    <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-4">😕 词库未找到</p>
                    <Link href="/practice" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline">
                        返回词库列表
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            {/* 暗黑模式切换按钮 */}
            <DarkModeToggle />

            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-transparent dark:border-gray-700">
                {/* 返回按钮 */}
                <Link
                    href="/practice"
                    className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">返回词库列表</span>
                    <span className="sm:hidden">返回</span>
                </Link>

                <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 text-center sm:text-left">
                    <span className="text-4xl sm:text-5xl mb-2 sm:mb-0 sm:mr-3">{bookConfig.icon}</span>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{bookConfig.title}</h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{bookConfig.description}</p>
                    </div>
                </div>

                {/* 练习统计 */}
                {totalPracticeCount > 0 && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <span className="text-gray-600 dark:text-gray-300">
                                    📝 已练习: <span className="font-bold text-indigo-600 dark:text-indigo-400">{practicedIndices.size}</span> / {vocabulary.length} 个
                                </span>
                                <span className="text-gray-600 dark:text-gray-300">
                                    🎯 剩余: <span className="font-bold text-purple-600 dark:text-purple-400">
                                        {vocabulary.length - practicedIndices.size}
                                    </span> 个
                                </span>
                            </div>
                            {practicedIndices.size === vocabulary.length && (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium animate-pulse">
                                    🎉 全部完成！
                                </span>
                            )}
                        </div>

                        {/* 进度条 */}
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 transition-all duration-500"
                                style={{
                                    width: `${(practicedIndices.size / vocabulary.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* 按钮区域 - 合并随机听写和重新播放 */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <button
                        onClick={handleRandomDictation}
                        disabled={isSpeaking || practicedIndices.size >= vocabulary.length}
                        className={`
              px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-white text-base sm:text-lg
              transition-all duration-300 transform
              ${isSpeaking || practicedIndices.size >= vocabulary.length
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                            }
            `}
                    >
                        {isSpeaking
                            ? '🔊 朗读中...'
                            : practicedIndices.size >= vocabulary.length
                                ? '🎉 已完成'
                                : currentWord
                                    ? '➡️ 下一个'
                                    : '🎲 随机听写'
                        }
                    </button>

                    <button
                        onClick={handleReplay}
                        disabled={!currentWord || isSpeaking}
                        className={`
              px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-white text-base sm:text-lg
              transition-all duration-300 transform
              ${!currentWord || isSpeaking
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                            }
            `}
                    >
                        🔊 重新播放
                    </button>
                </div>

                {/* 显示当前单词信息 */}
                {currentWord && (
                    <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                        {/* 带遮罩的内容区域 */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsContentVisible(true)}
                            onMouseLeave={() => setIsContentVisible(false)}
                            onTouchStart={() => setIsContentVisible(!isContentVisible)}
                        >
                            {/* 遮罩层 */}
                            {!isContentVisible && (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-700/80 dark:from-gray-950/90 dark:to-gray-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 transition-opacity duration-300">
                                    <div className="text-center text-white">
                                        <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <p className="text-sm sm:text-base font-medium">点击查看答案</p>
                                    </div>
                                </div>
                            )}

                            {/* 内容区域 */}
                            <div className={`space-y-3 sm:space-y-4 transition-all duration-300 ${!isContentVisible ? 'blur-sm' : ''}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 sm:w-24">日汉字：</span>
                                    <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{currentWord.日汉字}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 sm:w-24">平假名：</span>
                                    <span className="text-lg sm:text-xl text-purple-600 dark:text-purple-400">{currentWord.平假名}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                                    <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 sm:w-24">中文：</span>
                                    <span className="text-base sm:text-lg text-gray-700 dark:text-gray-300">{currentWord.中文}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 提示信息 */}
                {!currentWord && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-6 sm:mt-8 px-4">
                        <p className="text-base sm:text-lg">👆 点击上方按钮开始听写练习</p>
                        <p className="text-xs sm:text-sm mt-2">词库共有 {vocabulary.length} 个单词</p>
                    </div>
                )}

                {/* 键盘快捷键提示 - 仅桌面端显示 */}
                {currentWord && practicedIndices.size < vocabulary.length && (
                    <div className="hidden sm:block mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs font-semibold shadow-sm">Enter</kbd>
                                <span>听写下一个</span>
                            </span>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs font-semibold shadow-sm">Space</kbd>
                                <span>按住查看答案</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* 完成后的操作 */}
                {practicedIndices.size >= vocabulary.length && (
                    <div className="text-center mt-4 sm:mt-6 p-4 sm:p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎊</div>
                        <h3 className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400 mb-2">恭喜完成！</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                            你已经完成了本词库的所有 {vocabulary.length} 个单词！
                        </p>
                        <button
                            onClick={() => {
                                setPracticedIndices(new Set());
                                setTotalPracticeCount(0);
                                setCurrentWord(null);
                                setCurrentIndex(null);
                            }}
                            className="px-5 sm:px-6 py-2 sm:py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                        >
                            🔄 重新开始
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
