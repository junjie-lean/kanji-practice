'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getBookById, loadVocabularyBook, type BookConfig } from './config';

interface Word {
    日汉字: string;
    平假名: string;
    中文: string;
}

// 声明 ResponsiveVoice 类型
declare global {
    interface Window {
        responsiveVoice: {
            speak: (text: string, voice: string, parameters?: {
                pitch?: number;
                rate?: number;
                volume?: number;
                onstart?: () => void;
                onend?: () => void;
                onerror?: (error: any) => void;
            }) => void;
            cancel: () => void;
            isPlaying: () => boolean;
            voiceSupport: () => boolean;
            getVoices: () => any[];
        };
    }
}

export default function PracticeLesson() {
    const router = useRouter();
    const { book: bookId } = router.query;

    const [bookConfig, setBookConfig] = useState<BookConfig | null>(null);
    const [vocabulary, setVocabulary] = useState<Word[]>([]);
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null); // 新增：记录当前单词索引
    const [practicedIndices, setPracticedIndices] = useState<Set<number>>(new Set()); // 新增：所有练习过的单词索引
    const [totalPracticeCount, setTotalPracticeCount] = useState(0); // 新增：总练习次数
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
        const checkRV = setInterval(() => {
            if (window.responsiveVoice) {
                setIsRVLoaded(true);
                console.log('✅ ResponsiveVoice 已就绪');
                clearInterval(checkRV);
            }
        }, 100);

        return () => clearInterval(checkRV);
    }, []);

    // 简化后的随机选择单词算法 - 每个单词只出现一次
    const selectRandomWord = () => {
        if (vocabulary.length === 0) return null;

        // 获取所有未练习过的索引
        const availableIndices: number[] = [];
        for (let i = 0; i < vocabulary.length; i++) {
            if (!practicedIndices.has(i)) {
                availableIndices.push(i);
            }
        }

        // 如果所有单词都练习完了
        if (availableIndices.length === 0) {
            console.log('🎉 所有单词已练习完成！');
            return null;
        }

        // 从未练习的单词中随机选择
        const randomIndex = availableIndices[
            Math.floor(Math.random() * availableIndices.length)
        ];
        const selectedWord = vocabulary[randomIndex];

        // 更新状态
        setCurrentWord(selectedWord);
        setCurrentIndex(randomIndex);
        setIsContentVisible(false);

        // 添加到已练习集合
        setPracticedIndices(prev => {
            const newSet = new Set(prev);
            newSet.add(randomIndex);
            return newSet;
        });

        // 增加总练习次数
        setTotalPracticeCount(prev => prev + 1);

        console.log(`✅ 选择单词 [${randomIndex}]: ${selectedWord.日汉字}`);
        console.log(`📊 已练习: ${practicedIndices.size + 1}/${vocabulary.length}`);
        console.log(`📈 剩余: ${availableIndices.length - 1} 个`);

        return selectedWord;
    };

    // 使用 ResponsiveVoice 朗读
    const speakWithResponsiveVoice = (word: Word) => {
        if (!window.responsiveVoice) {
            alert('ResponsiveVoice 未加载，请刷新页面重试');
            return;
        }

        window.responsiveVoice.cancel();
        const textToSpeak = word.平假名 || word.日汉字;

        window.responsiveVoice.speak(
            textToSpeak,
            'Japanese Female',
            {
                pitch: 1.1,
                rate: 0.8,
                volume: 1,
                onstart: () => {
                    console.log('开始播放:', textToSpeak);
                    setIsSpeaking(true);
                },
                onend: () => {
                    console.log('播放结束');
                    setIsSpeaking(false);
                },
                onerror: (error) => {
                    console.error('播放错误:', error);
                    setIsSpeaking(false);
                    alert('播放失败，请检查网络连接');
                }
            }
        );
    };

    // 随机听写
    const handleRandomDictation = () => {
        const word = selectRandomWord();
        if (word) {
            speakWithResponsiveVoice(word);
        }
    };

    // 重新播放
    const handleReplay = () => {
        if (currentWord) {
            speakWithResponsiveVoice(currentWord);
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

                {/* 随机听写按钮 */}
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
                                ? '朗读中...'
                                : practicedIndices.size >= vocabulary.length
                                    ? '🎉 已完成'
                                    : '🎲 随机听写'
                        }
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

                        {/* 重新播放按钮 */}
                        <button
                            onClick={handleReplay}
                            disabled={isSpeaking || !isRVLoaded}
                            className={`
                mt-4 w-full py-2 rounded-lg font-medium
                transition-all duration-200
                ${isSpeaking || !isRVLoaded
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-purple-500 text-white hover:bg-purple-600'
                                }
              `}
                        >
                            🔊 重新播放
                        </button>
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
