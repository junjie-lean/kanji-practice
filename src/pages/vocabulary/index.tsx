'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle';
import { VOCABULARY_BOOKS, loadVocabularyBook } from '@/data/config';

interface Word {
    日汉字: string;
    平假名: string;
    中文: string;
}

interface WordWithIndex extends Word {
    originalIndex: number;
}

export default function VocabularyPage() {
    const [allWords, setAllWords] = useState<WordWithIndex[]>([]);
    const [displayWords, setDisplayWords] = useState<WordWithIndex[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isReadMode, setIsReadMode] = useState(false); // false = 记忆模式, true = 阅读模式
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 加载所有词库
    useEffect(() => {
        const loadAllWords = async () => {
            setIsLoading(true);
            const allLoadedWords: WordWithIndex[] = [];
            let globalIndex = 0;

            for (const book of VOCABULARY_BOOKS) {
                const words = await loadVocabularyBook(book.filename);
                if (words) {
                    words.forEach((word: Word) => {
                        allLoadedWords.push({
                            ...word,
                            originalIndex: globalIndex++
                        });
                    });
                }
            }

            setAllWords(allLoadedWords);
            setDisplayWords(allLoadedWords);
            setIsLoading(false);
        };

        loadAllWords();
    }, []);

    // 搜索过滤
    const filteredWords = useMemo(() => {
        if (!searchTerm.trim()) {
            return displayWords;
        }

        const term = searchTerm.toLowerCase().trim();
        return displayWords.filter(word =>
            word.日汉字.toLowerCase().includes(term) ||
            word.平假名.toLowerCase().includes(term) ||
            word.中文.toLowerCase().includes(term)
        );
    }, [displayWords, searchTerm]);

    // 洗牌算法（Fisher-Yates）
    const shuffleWords = () => {
        const shuffled = [...displayWords];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setDisplayWords(shuffled);
    };

    // 切换模式
    const toggleMode = () => {
        setIsReadMode(!isReadMode);
    };

    // 渲染单元格内容
    const renderCell = (content: string, rowIndex: number, type: 'kanji' | 'chinese') => {
        // 阅读模式：直接显示
        if (isReadMode) {
            return content;
        }

        // 记忆模式：悬停显示
        const isHovered = hoveredIndex === rowIndex;
        return isHovered ? content : '***';
    };

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

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 py-6 sm:py-12 px-4">
            {/* 暗黑模式切换按钮 */}
            <DarkModeToggle />

            <div className="max-w-7xl mx-auto">
                {/* 返回按钮 */}
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors group"
                >
                    <svg className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">返回主页</span>
                    <span className="sm:hidden">返回</span>
                </Link>

                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-3">
                        🔍 单词检索
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                        共 {allWords.length} 个单词
                    </p>
                </div>

                {/* 工具栏 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-transparent dark:border-gray-700">
                    {/* 搜索框 */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="搜索日汉字、平假名或中文含义..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                        />
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={shuffleWords}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            乱序
                        </button>

                        <button
                            onClick={toggleMode}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${isReadMode
                                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isReadMode ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                )}
                            </svg>
                            {isReadMode ? '记忆模式' : '阅读模式'}
                        </button>

                        {searchTerm && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 ml-auto">
                                找到 <span className="font-bold text-indigo-600 dark:text-indigo-400 mx-1">{filteredWords.length}</span> 个结果
                            </div>
                        )}
                    </div>
                </div>

                {/* 表格容器 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-transparent dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-700 dark:to-purple-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider" style={{ width: '10%' }}>
                                        序号
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider" style={{ width: '25%' }}>
                                        假名
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider" style={{ width: '25%' }}>
                                        日汉字
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider" style={{ width: '40%' }}>
                                        中文含义
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredWords.map((word, index) => (
                                    <tr
                                        key={`${word.originalIndex}-${index}`}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className={`transition-colors ${hoveredIndex === index
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 text-sm sm:text-base font-medium text-purple-600 dark:text-purple-400">
                                            {word.平假名}
                                        </td>
                                        <td className="px-4 py-3 text-sm sm:text-base text-gray-900 dark:text-white font-medium">
                                            {renderCell(word.日汉字, index, 'kanji')}
                                        </td>
                                        <td className="px-4 py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                            {renderCell(word.中文, index, 'chinese')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 无结果提示 */}
                    {filteredWords.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                未找到匹配的单词
                            </p>
                        </div>
                    )}
                </div>

                {/* 提示信息 */}
                {!isReadMode && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            💡 提示：鼠标悬停在行上可以查看答案
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

