'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllBooksWithCount, type BookConfigWithCount } from '../../data/config';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function PracticeHome() {
  const [books, setBooks] = useState<BookConfigWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      const booksWithCount = await getAllBooksWithCount();
      setBooks(booksWithCount);
      setIsLoading(false);
    };
    loadBooks();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">加载词库中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-12 px-4 transition-colors duration-300">
      {/* 暗黑模式切换按钮 */}
      <DarkModeToggle />

      <div className="max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 sm:mb-8 transition-colors group"
        >
          <svg className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">返回主页</span>
          <span className="sm:hidden">返回</span>
        </Link>

        {/* 页面标题 */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">
            📚 日语听写练习
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 px-4">
            选择一个词库开始练习
          </p>
        </div>

        {/* 词库网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/practice/${book.id}`}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl dark:hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-transparent dark:border-gray-700">
                {/* 卡片头部 - 渐变色背景 */}
                <div className={`h-28 sm:h-32 bg-gradient-to-br ${book.color} flex items-center justify-center`}>
                  <span className="text-5xl sm:text-6xl">{book.icon}</span>
                </div>

                {/* 卡片内容 */}
                <div className="p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {book.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 h-10 sm:h-12">
                    {book.description}
                  </p>

                  {/* 词库信息 */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-sm">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {book.wordCount} 词
                      </span>

                      {book.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${book.difficulty === 'easy'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : book.difficulty === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                          {book.difficulty === 'easy' ? '简单' :
                            book.difficulty === 'medium' ? '中等' : '困难'}
                        </span>
                      )}
                    </div>

                    <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center whitespace-nowrap">
                      开始练习
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* 添加新词库的占位卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center p-6 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer group">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity">
                ➕
              </div>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                更多词库<br />即将推出
              </p>
            </div>
          </div>
        </div>

        {/* 页面底部提示 */}
        <div className="mt-8 sm:mt-12 text-center text-gray-500 dark:text-gray-400 px-4">
          <p className="text-xs sm:text-sm">
            💡 提示：每个单词只会出现一次，练习完可重新开始
          </p>
        </div>
      </div>
    </div>
  );
}