import { useEffect, useState } from 'react'
import './Splash.css'

const Splash = ({ onFinish }) => {
  const [fadeout, setFadeout] = useState(false)

  useEffect(() => {
    // Показываем заставку 1.5 секунды
    const timer = setTimeout(() => {
      setFadeout(true)
      // Ждём завершения fade-out анимации (300ms)
      setTimeout(() => {
        onFinish()
      }, 300)
    }, 1500)

    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div className={`splash-container ${fadeout ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">📝</div>
        <h1 className="splash-title">OllamaIDE</h1>
        <p className="splash-subtitle">AI редактор кода</p>
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      </div>
    </div>
  )
}

export default Splash
