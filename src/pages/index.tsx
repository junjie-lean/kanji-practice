import { Inter } from 'next/font/google';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/router';
import DarkModeToggle from '@/components/DarkModeToggle';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const router = useRouter();
  return (
    <main className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 ${inter.className}`}>
      {/* 暗黑模式切换按钮 */}
      <DarkModeToggle />

      {/* 主内容 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          {/* 标题 */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              未来日语单词记忆助手
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              (　JLPT 私たちは来ました！！！)
            </p>
          </div>

          {/* 导航按钮组 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-6xl">
            <Button
              size="lg"
              color="primary"
              className="w-full h-16 text-lg font-semibold"
              onClick={() => router.push('/')}
            >
              🏠 首页
            </Button>

            <Button
              size="lg"
              color="success"
              className="w-full h-16 text-lg font-semibold"
              onClick={() => router.push('/practice')}
            >
              📚 开始练习
            </Button>

            <Button
              size="lg"
              color="secondary"
              className="w-full h-16 text-lg font-semibold"
              onClick={() => router.push('/vocabulary')}
            >
              🔍 单词检索
            </Button>

            <Button
              size="lg"
              color="warning"
              className="w-full h-16 text-lg font-semibold"
              onClick={() => router.push('/games/flashcard')}
            >
              🎮 记忆卡片
            </Button>
          </div>

          {/* 特性介绍 */}
          <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full max-w-6xl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                精准听写
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                高质量语音合成，帮助你准确识别日语发音
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                响应式设计
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                支持桌面和移动端，随时随地学习
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                暗黑模式
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                护眼模式，夜间学习更舒适
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎴</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                记忆卡片
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                通过翻转卡片互动学习，加深单词记忆
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
