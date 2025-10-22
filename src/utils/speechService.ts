// ResponsiveVoice 类型定义
declare global {
	interface Window {
		responsiveVoice: {
			speak: (
				text: string,
				voice: string,
				parameters?: {
					pitch?: number
					rate?: number
					volume?: number
					onstart?: () => void
					onend?: () => void
					onerror?: (error: any) => void
				}
			) => void
			cancel: () => void
			isPlaying: () => boolean
			voiceSupport: () => boolean
			getVoices: () => any[]
		}
	}
}

export interface SpeechConfig {
	pitch?: number
	rate?: number
	volume?: number
}

export interface SpeechCallbacks {
	onStart?: () => void
	onEnd?: () => void
	onError?: (error: any) => void
}

class SpeechService {
	private defaultConfig: SpeechConfig = {
		pitch: 0.9,
		rate: 1.1,
		volume: 1,
	}

	/**
	 * 检查 ResponsiveVoice 是否已加载
	 */
	isLoaded(): boolean {
		return typeof window !== 'undefined' && !!window.responsiveVoice
	}

	/**
	 * 等待 ResponsiveVoice 加载完成
	 */
	async waitForLoad(timeout: number = 10000): Promise<boolean> {
		const startTime = Date.now()

		return new Promise(resolve => {
			const checkInterval = setInterval(() => {
				if (this.isLoaded()) {
					clearInterval(checkInterval)
					resolve(true)
				} else if (Date.now() - startTime > timeout) {
					clearInterval(checkInterval)
					resolve(false)
				}
			}, 100)
		})
	}

	/**
	 * 停止当前播放
	 */
	cancel(): void {
		if (this.isLoaded()) {
			window.responsiveVoice.cancel()
		}
	}

	/**
	 * 检查是否正在播放
	 */
	isPlaying(): boolean {
		return this.isLoaded() && window.responsiveVoice.isPlaying()
	}

	/**
	 * 朗读日语文本
	 * @param text 要朗读的文本
	 * @param callbacks 回调函数
	 * @param config 配置选项（可选）
	 */
	speak(text: string, callbacks?: SpeechCallbacks, config?: SpeechConfig): boolean {
		if (!this.isLoaded()) {
			console.error('ResponsiveVoice 未加载')
			callbacks?.onError?.(new Error('ResponsiveVoice not loaded'))
			return false
		}

		// 停止当前播放
		this.cancel()

		// 合并配置
		const finalConfig = { ...this.defaultConfig, ...config }

		try {
			window.responsiveVoice.speak(text, 'Japanese Female', {
				pitch: finalConfig.pitch,
				rate: finalConfig.rate,
				volume: finalConfig.volume,
				onstart: () => {
					console.log('🔊 开始播放:', text)
					callbacks?.onStart?.()
				},
				onend: () => {
					console.log('✅ 播放结束')
					callbacks?.onEnd?.()
				},
				onerror: error => {
					console.error('❌ 播放错误:', error)
					callbacks?.onError?.(error)
				},
			})
			return true
		} catch (error) {
			console.error('❌ 播放失败:', error)
			callbacks?.onError?.(error)
			return false
		}
	}

	/**
	 * 获取可用的语音列表
	 */
	getVoices(): any[] {
		if (this.isLoaded()) {
			return window.responsiveVoice.getVoices()
		}
		return []
	}
}

// 导出单例
export const speechService = new SpeechService()
