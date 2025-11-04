export interface BookConfig {
	id: string
	title: string
	description: string
	filename: string
	difficulty?: 'easy' | 'medium' | 'hard'
	icon?: string
	color?: string
}

export const VOCABULARY_BOOKS: BookConfig[] = [
	{
		id: 'kotoba_1',
		title: '第1课词汇',
		description: '基础词汇',
		filename: 'kotoba_1.json',
		difficulty: 'easy',
		icon: '📕',
		color: 'from-red-500 via-red-400 to-red-700',
	},
	{
		id: 'kotoba_2',
		title: '第2课词汇',
		description: '基础词汇',
		filename: 'kotoba_2.json',
		difficulty: 'easy',
		icon: '📗',
		color: 'from-green-400 via-green-300 to-green-700',
	},
	{
		id: 'kotoba_3',
		title: '第3课词汇',
		description: '动词、时间相关词汇',
		filename: 'kotoba_3.json',
		difficulty: 'easy',
		icon: '📘',
		color: 'from-blue-400 via-blue-300 to-blue-700',
	},
	{
		id: 'kotoba_4',
		title: '第4课词汇',
		description: '动词、时间相关词汇',
		filename: 'kotoba_4.json',
		difficulty: 'easy',
		icon: '📙',
		color: 'from-yellow-400 via-yellow-300 to-yellow-700',
	},
	{
		id: 'kotoba_5',
		title: '第5课词汇',
		description: '动词、时间相关词汇',
		filename: 'kotoba_5.json',
		difficulty: 'easy',
		icon: '📚',
		color: 'from-sky-400 via-sky-300 to-sky-700',
	},
	{
		id: 'kotoba_6',
		title: '第6课词汇',
		description: '动词、人物相关词汇',
		filename: 'kotoba_6.json',
		difficulty: 'easy',
		icon: '📚',
		color: 'from-orange-400 via-orange-300 to-orange-700',
	},
	{
		id: 'kotoba_7',
		title: '第7课词汇',
		description: '形容词',
		filename: 'kotoba_7.json',
		difficulty: 'easy',
		icon: '📚',
		color: 'from-purple-400 via-purple-300 to-purple-700',
	},
	{
		id: 'kotoba_8',
		title: '第8课词汇',
		description: '形容词',
		filename: 'kotoba_8.json',
		difficulty: 'easy',
		icon: '📚',
		color: 'from-pink-400 via-pink-300 to-pink-700',
	},
]

// 根据 ID 获取词库配置
export function getBookById(id: string): BookConfig | undefined {
	return VOCABULARY_BOOKS.find(book => book.id === id)
}

// 动态导入词库 JSON 文件
export async function loadVocabularyBook(filename: string) {
	try {
		// eslint-disable-next-line @next/next/no-assign-module-variable
		const module = await import(`./kotoba/${filename}`)
		return module.default
	} catch (error) {
		console.error(`Failed to load vocabulary book: ${filename}`, error)
		return null
	}
}

// 新增：获取词库详细信息（包含单词数量）
export interface BookConfigWithCount extends BookConfig {
	wordCount: number
}

export async function getBookConfigWithCount(config: BookConfig): Promise<BookConfigWithCount> {
	const words = await loadVocabularyBook(config.filename)
	return {
		...config,
		wordCount: words ? words.length : 0,
	}
}

// 新增：批量获取所有词库的详细信息
export async function getAllBooksWithCount(): Promise<BookConfigWithCount[]> {
	const promises = VOCABULARY_BOOKS.map(book => getBookConfigWithCount(book))
	return Promise.all(promises)
}
