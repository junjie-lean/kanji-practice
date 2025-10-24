import { useEffect, useState } from 'react'

export function useDarkMode() {
	const [darkMode, setDarkMode] = useState(false)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		// 从 localStorage 读取用户偏好，或检测系统主题
		const isDark =
			localStorage.getItem('darkMode') === 'true' ||
			(!localStorage.getItem('darkMode') &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
		setDarkMode(isDark)
		if (isDark) {
			document.documentElement.classList.add('dark')
		}
	}, [])

	useEffect(() => {
		if (!mounted) return

		if (darkMode) {
			document.documentElement.classList.add('dark')
			localStorage.setItem('darkMode', 'true')
		} else {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('darkMode', 'false')
		}
	}, [darkMode, mounted])

	const toggleDarkMode = () => {
		setDarkMode(!darkMode)
	}

	return { darkMode, toggleDarkMode, mounted }
}
