/**
 * Flashcard localStorage 工具函数
 * 用于管理单词卡片的配置、进度和统计数据
 */

// ==================== 类型定义 ====================

export type DisplayMode = 'ja-to-zh' | 'zh-to-ja'
export type CardStatus = 'learning' | 'mastered' | 'need_review'

export interface WordProgress {
	status: CardStatus
	reviewCount: number
	lastReviewDate: string
}

export interface FlashcardConfig {
	mode: DisplayMode
	shuffled: boolean
}

export interface FlashcardStats {
	totalCards: number
	masteredCards: number
	needReviewCards: number
	learningCards: number
}

// ==================== 常量定义 ====================

const STORAGE_KEYS = {
	CONFIG: 'flashcard_config',
	PROGRESS: 'flashcard_progress',
} as const

const DEFAULT_CONFIG: FlashcardConfig = {
	mode: 'ja-to-zh',
	shuffled: true,
}

// ==================== 辅助函数 ====================

/**
 * 安全地从 localStorage 读取数据
 */
function safeGetItem(key: string): string | null {
	try {
		if (typeof window === 'undefined') return null
		return localStorage.getItem(key)
	} catch (error) {
		console.error(`Failed to get item from localStorage: ${key}`, error)
		return null
	}
}

/**
 * 安全地向 localStorage 写入数据
 */
function safeSetItem(key: string, value: string): boolean {
	try {
		if (typeof window === 'undefined') return false
		localStorage.setItem(key, value)
		return true
	} catch (error) {
		console.error(`Failed to set item to localStorage: ${key}`, error)
		return false
	}
}

/**
 * 安全地从 localStorage 删除数据
 */
function safeRemoveItem(key: string): boolean {
	try {
		if (typeof window === 'undefined') return false
		localStorage.removeItem(key)
		return true
	} catch (error) {
		console.error(`Failed to remove item from localStorage: ${key}`, error)
		return false
	}
}

// ==================== 配置管理 ====================

/**
 * 获取用户配置
 */
export function getConfig(): FlashcardConfig {
	const configStr = safeGetItem(STORAGE_KEYS.CONFIG)
	if (!configStr) return DEFAULT_CONFIG

	try {
		const config = JSON.parse(configStr) as FlashcardConfig
		return {
			mode: config.mode || DEFAULT_CONFIG.mode,
			shuffled: config.shuffled ?? DEFAULT_CONFIG.shuffled,
		}
	} catch (error) {
		console.error('Failed to parse config:', error)
		return DEFAULT_CONFIG
	}
}

/**
 * 保存用户配置
 */
export function saveConfig(config: FlashcardConfig): boolean {
	return safeSetItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
}

// ==================== 进度管理 ====================

/**
 * 获取单个单词的学习进度
 */
export function getProgress(wordId: string): WordProgress | null {
	const allProgress = getAllProgress()
	return allProgress[wordId] || null
}

/**
 * 保存单个单词的学习进度
 */
export function saveProgress(wordId: string, progress: WordProgress): boolean {
	const allProgress = getAllProgress()
	allProgress[wordId] = progress
	return safeSetItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress))
}

/**
 * 获取所有单词的学习进度
 */
export function getAllProgress(): Record<string, WordProgress> {
	const progressStr = safeGetItem(STORAGE_KEYS.PROGRESS)
	if (!progressStr) return {}

	try {
		return JSON.parse(progressStr) as Record<string, WordProgress>
	} catch (error) {
		console.error('Failed to parse progress:', error)
		return {}
	}
}

/**
 * 批量保存学习进度
 */
export function saveAllProgress(progress: Record<string, WordProgress>): boolean {
	return safeSetItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
}

// ==================== 统计数据 ====================

/**
 * 计算统计数据
 */
export function getStats(totalCards: number): FlashcardStats {
	const allProgress = getAllProgress()

	let masteredCards = 0
	let needReviewCards = 0
	let learningCards = 0

	Object.values(allProgress).forEach(progress => {
		switch (progress.status) {
			case 'mastered':
				masteredCards++
				break
			case 'need_review':
				needReviewCards++
				break
			case 'learning':
				learningCards++
				break
		}
	})

	return {
		totalCards,
		masteredCards,
		needReviewCards,
		learningCards,
	}
}

// ==================== 数据清理 ====================

/**
 * 清除所有学习进度
 */
export function clearAllProgress(): boolean {
	return safeRemoveItem(STORAGE_KEYS.PROGRESS)
}

/**
 * 清除所有数据（包括配置和进度）
 */
export function clearAllData(): boolean {
	const configCleared = safeRemoveItem(STORAGE_KEYS.CONFIG)
	const progressCleared = safeRemoveItem(STORAGE_KEYS.PROGRESS)
	return configCleared && progressCleared
}

// ==================== 辅助工具 ====================

/**
 * 创建新的学习进度记录
 */
export function createProgress(status: CardStatus = 'learning'): WordProgress {
	return {
		status,
		reviewCount: 0,
		lastReviewDate: new Date().toISOString(),
	}
}

/**
 * 更新学习进度
 */
export function updateProgress(existing: WordProgress | null, newStatus: CardStatus): WordProgress {
	const now = new Date().toISOString()

	if (!existing) {
		return {
			status: newStatus,
			reviewCount: 1,
			lastReviewDate: now,
		}
	}

	return {
		status: newStatus,
		reviewCount: existing.reviewCount + 1,
		lastReviewDate: now,
	}
}
