/**
 * 即时字符串比对工具
 * 用于检查用户输入是否与目标字符串匹配
 */

/**
 * 比对状态枚举
 */
export enum ComparisonStatus {
	EMPTY = 'empty', // 未输入
	CORRECT = 'correct', // 完全正确
	PARTIAL = 'partial', // 部分正确（前缀匹配）
	ERROR = 'error', // 有错误
}

/**
 * 即时比对用户输入和目标字符串
 * @param input 用户输入的字符串
 * @param target 目标字符串（正确答案）
 * @returns 比对状态
 */
export function compareStrings(input: string, target: string): ComparisonStatus {
	// 未输入
	if (!input || input.length === 0) {
		return ComparisonStatus.EMPTY
	}

	// 完全正确
	if (input === target) {
		return ComparisonStatus.CORRECT
	}

	// 检查是否是正确的前缀
	if (target.startsWith(input)) {
		return ComparisonStatus.PARTIAL
	}

	// 有错误
	return ComparisonStatus.ERROR
}

/**
 * 获取比对状态对应的边框样式类名
 * @param status 比对状态
 * @returns Tailwind CSS 类名
 */
export function getBorderClass(status: ComparisonStatus): string {
	switch (status) {
		case ComparisonStatus.EMPTY:
			return 'border-gray-300 dark:border-gray-600'
		case ComparisonStatus.CORRECT:
			return 'border-green-500 dark:border-green-400'
		case ComparisonStatus.PARTIAL:
			return 'border-gray-300 dark:border-gray-600'
		case ComparisonStatus.ERROR:
			return 'border-red-500 dark:border-red-400'
		default:
			return 'border-gray-300 dark:border-gray-600'
	}
}

/**
 * 获取比对状态对应的聚焦环样式类名
 * @param status 比对状态
 * @returns Tailwind CSS 类名
 */
export function getFocusRingClass(status: ComparisonStatus): string {
	switch (status) {
		case ComparisonStatus.CORRECT:
			return 'focus:ring-green-500 dark:focus:ring-green-400'
		case ComparisonStatus.ERROR:
			return 'focus:ring-red-500 dark:focus:ring-red-400'
		default:
			return 'focus:ring-indigo-500 dark:focus:ring-indigo-400'
	}
}
