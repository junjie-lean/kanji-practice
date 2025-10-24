export interface SpeechCallbacks {
	onStart?: () => void
	onEnd?: () => void
	onError?: (error: any) => void
}

class SpeechService {
	private currentAudio: HTMLAudioElement | null = null
	private speechSynthesis: SpeechSynthesis | null = null
	private currentUtterance: SpeechSynthesisUtterance | null = null

	constructor() {
		// 初始化 Web Speech API
		if (typeof window !== 'undefined' && window.speechSynthesis) {
			this.speechSynthesis = window.speechSynthesis
		}
	}

	/**
	 * 停止当前播放
	 */
	cancel(): void {
		// 停止音频播放
		if (this.currentAudio) {
			this.currentAudio.pause()
			this.currentAudio.currentTime = 0
			this.currentAudio = null
		}

		// 停止 TTS 播放
		if (this.speechSynthesis && this.currentUtterance) {
			this.speechSynthesis.cancel()
			this.currentUtterance = null
		}
	}

	/**
	 * 检查是否正在播放
	 */
	isPlaying(): boolean {
		const audioPlaying = this.currentAudio !== null && !this.currentAudio.paused
		const ttsPlaying = this.speechSynthesis?.speaking || false
		return audioPlaying || ttsPlaying
	}

	/**
	 * 使用浏览器 TTS API 播放（降级方案）
	 */
	private speakWithBrowserTTS(text: string, callbacks?: SpeechCallbacks): boolean {
		if (!this.speechSynthesis) {
			console.error('浏览器不支持 Speech Synthesis API')
			callbacks?.onError?.(new Error('Browser does not support Speech Synthesis'))
			return false
		}

		try {
			this.currentUtterance = new SpeechSynthesisUtterance(text)
			this.currentUtterance.lang = 'ja-JP' // 日语
			this.currentUtterance.rate = 1.0
			this.currentUtterance.pitch = 1.0
			this.currentUtterance.volume = 1.0

			this.currentUtterance.onstart = () => {
				console.log('🔊 TTS 开始播放:', text)
				callbacks?.onStart?.()
			}

			this.currentUtterance.onend = () => {
				console.log('✅ TTS 播放结束')
				callbacks?.onEnd?.()
				this.currentUtterance = null
			}

			this.currentUtterance.onerror = event => {
				console.error('❌ TTS 播放错误:', event)
				callbacks?.onError?.(event)
				this.currentUtterance = null
			}

			this.speechSynthesis.speak(this.currentUtterance)
			return true
		} catch (error) {
			console.error('❌ TTS 创建失败:', error)
			callbacks?.onError?.(error)
			return false
		}
	}

	/**
	 * 使用有道 API 播放（主要方案）
	 */
	private async speakWithYoudao(text: string, callbacks?: SpeechCallbacks): Promise<boolean> {
		return new Promise(resolve => {
			try {
				// URL 编码文本
				const encodedText = encodeURIComponent(text)

				// 构建有道语音 API 地址
				const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodedText}&le=jap`

				// 创建新的音频对象
				this.currentAudio = new Audio(audioUrl)

				// 设置超时时间（5秒）
				const timeout = setTimeout(() => {
					console.warn('⚠️ 有道 API 加载超时，降级使用浏览器 TTS')
					this.cancel()
					resolve(false)
				}, 5000)

				// 设置事件监听
				this.currentAudio.onloadstart = () => {
					clearTimeout(timeout)
					console.log('🔊 有道 API 开始播放:', text)
					callbacks?.onStart?.()
				}

				this.currentAudio.onended = () => {
					clearTimeout(timeout)
					console.log('✅ 有道 API 播放结束')
					callbacks?.onEnd?.()
					this.currentAudio = null
					resolve(true)
				}

				this.currentAudio.onerror = error => {
					clearTimeout(timeout)
					console.warn('⚠️ 有道 API 播放错误，降级使用浏览器 TTS:', error)
					this.currentAudio = null
					resolve(false)
				}

				// 开始播放
				this.currentAudio.play().catch(error => {
					clearTimeout(timeout)
					console.warn('⚠️ 有道 API 播放失败，降级使用浏览器 TTS:', error)
					this.currentAudio = null
					resolve(false)
				})
			} catch (error) {
				console.warn('⚠️ 有道 API 创建失败，降级使用浏览器 TTS:', error)
				resolve(false)
			}
		})
	}

	/**
	 * 朗读日语文本
	 * @param text 要朗读的文本
	 * @param callbacks 回调函数
	 */
	async speak(text: string, callbacks?: SpeechCallbacks): Promise<boolean> {
		if (!text || text.trim() === '') {
			console.error('文本不能为空')
			callbacks?.onError?.(new Error('Text cannot be empty'))
			return false
		}

		// 停止当前播放
		this.cancel()

		// 首先尝试使用有道 API
		const youdaoSuccess = await this.speakWithYoudao(text, callbacks)

		// 如果有道 API 失败，降级使用浏览器 TTS
		if (!youdaoSuccess) {
			console.log('🔄 使用浏览器 TTS 降级播放')
			return this.speakWithBrowserTTS(text, callbacks)
		}

		return true
	}
}

// 导出单例
export const speechService = new SpeechService()
