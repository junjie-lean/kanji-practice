'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getBookById, loadVocabularyBook, type BookConfig } from './config';
import { speechService } from '@/utils/speechService';

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
    const [isRVLoaded, setIsRVLoaded] = useState(false);
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

    // 检查 ResponsiveVoice
    useEffect(() => {
        const checkRV = async () => {
            const loaded = await speechService.waitForLoad();
            setIsRVLoaded(loaded);
            if (loaded) {
                console.log('✅ ResponsiveVoice 已就绪');
            } else {
                console.error('❌ ResponsiveVoice 加载超时');
            }
        };

        checkRV();
    }, []);

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
    const speakWord = (word: Word) => {
        const textToSpeak = word.平假名 || word.日汉字;

        const success = speechService.speak(
            textToSpeak,
            {
                onStart: () => setIsSpeaking(true),
                onEnd: () => setIsSpeaking(false),
                onError: (error) => {
                    setIsSpeaking(false);
                    alert('播放失败，请检查网络连接');
                }
            }
        );

        if (!success) {
            alert('ResponsiveVoice 未加载，请刷新页面重试');
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

    // 加载中
    if (isLoading) {
        return (
            <div className="w-full min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载词库中...</p>
                </div>
            </div>
        );
    }

    // 词库未找到
    if (!bookConfig || vocabulary.length === 0) {
        return (
            <div className="w-full min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <p className="text-2xl text-gray-600 mb-4">😕 词库未找到</p>
                    <Link href="/practice" className="text-indigo-600 hover:text-indigo-700 underline">
                        返回词库列表
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-[100vh] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                {/* 返回按钮 */}
                <Link
                    href="/practice"
                    className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-4 transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回词库列表
                </Link>

                <div className="flex items-center justify-center mb-8">
                    <span className="text-4xl mr-3">{bookConfig.icon}</span>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{bookConfig.title}</h1>
                        <p className="text-sm text-gray-500">{bookConfig.description}</p>
                    </div>

                    {/* ResponsiveVoice 状态指示器 */}
                    <div className="ml-auto flex items-center">
                        {isRVLoaded ? (
                            <span className="flex items-center text-xs text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                已就绪
                            </span>
                        ) : (
                            <span className="flex items-center text-xs text-yellow-600">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span>
                                加载中...
                            </span>
                        )}
                    </div>
                </div>

                {/* 练习统计 */}
                {totalPracticeCount > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600">
                                    📝 已练习: <span className="font-bold text-indigo-600">{practicedIndices.size}</span> / {vocabulary.length} 个
                                </span>
                                <span className="text-gray-600">
                                    🎯 剩余: <span className="font-bold text-purple-600">
                                        {vocabulary.length - practicedIndices.size}
                                    </span> 个
                                </span>
                            </div>
                            {practicedIndices.size === vocabulary.length && (
                                <span className="text-xs text-green-600 font-medium animate-pulse">
                                    🎉 全部完成！
                                </span>
                            )}
                        </div>

                        {/* 进度条 */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                style={{
                                    width: `${(practicedIndices.size / vocabulary.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* 按钮区域 - 合并随机听写和重新播放 */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={handleRandomDictation}
                        disabled={isSpeaking || !isRVLoaded || practicedIndices.size >= vocabulary.length}
                        className={`
              px-8 py-4 rounded-lg font-semibold text-white text-lg
              transition-all duration-300 transform
              ${isSpeaking || !isRVLoaded || practicedIndices.size >= vocabulary.length
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                            }
            `}
                    >
                        {!isRVLoaded
                            ? '⏳ 准备中...'
                            : isSpeaking
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
                        disabled={!currentWord || isSpeaking || !isRVLoaded}
                        className={`
              px-8 py-4 rounded-lg font-semibold text-white text-lg
              transition-all duration-300 transform
              ${!currentWord || isSpeaking || !isRVLoaded
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                            }
            `}
                    >
                        🔊 重新播放
                    </button>
                </div>

                {/* 显示当前单词信息 */}
                {currentWord && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                        {/* 带遮罩的内容区域 */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsContentVisible(true)}
                            onMouseLeave={() => setIsContentVisible(false)}
                        >
                            {/* 遮罩层 */}
                            {!isContentVisible && (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-700/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 transition-opacity duration-300">
                                    <div className="text-center text-white">
                                        <svg className="w-12 h-12 mx-auto mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <p className="font-medium">查看答案</p>
                                    </div>
                                </div>
                            )}

                            {/* 内容区域 */}
                            <div className={`space-y-4 transition-all duration-300 ${!isContentVisible ? 'blur-sm' : ''}`}>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-600 w-24">日汉字：</span>
                                    <span className="text-2xl font-bold text-gray-800">{currentWord.日汉字}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-600 w-24">平假名：</span>
                                    <span className="text-xl text-purple-600">{currentWord.平假名}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-600 w-24">中文：</span>
                                    <span className="text-lg text-gray-700">{currentWord.中文}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 提示信息 */}
                {!currentWord && (
                    <div className="text-center text-gray-500 mt-8">
                        <p className="text-lg">👆 点击上方按钮开始听写练习</p>
                        <p className="text-sm mt-2">词库共有 {vocabulary.length} 个单词</p>
                    </div>
                )}

                {/* 完成后的操作 */}
                {practicedIndices.size >= vocabulary.length && (
                    <div className="text-center mt-6 p-6 bg-green-50 rounded-xl border-2 border-green-200">
                        <div className="text-6xl mb-4">🎊</div>
                        <h3 className="text-2xl font-bold text-green-700 mb-2">恭喜完成！</h3>
                        <p className="text-gray-600 mb-4">
                            你已经完成了本词库的所有 {vocabulary.length} 个单词！
                        </p>
                        <button
                            onClick={() => {
                                setPracticedIndices(new Set());
                                setTotalPracticeCount(0);
                                setCurrentWord(null);
                                setCurrentIndex(null);
                            }}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                        >
                            🔄 重新开始
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
