import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { X, Camera, Barcode } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const onScanRef = useRef(onScan)

  // Update ref when onScan changes
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    let isMounted = true;

    // Ensure DOM element exists
    const element = document.getElementById('barcode-scanner');
    if (!element) {
      console.error('Scanner element not found');
      return;
    }

    console.log('Initializing barcode scanner...')
    setError(null)

    const initTimeout = setTimeout(() => {
      if (!isMounted) return;

      const config: any = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        verbose: true // Enable verbose logging
      }

      try {
        console.log('Creating scanner with config:', config)
        const scanner = new Html5QrcodeScanner('barcode-scanner', config, false)
        scannerRef.current = scanner

        const style = document.createElement('style')
        style.setAttribute('data-scanner-styles', 'true')
        style.innerHTML = `
          #barcode-scanner__dashboard_section_csr > span:last-child {
            display: none !important;
          }
          #barcode-scanner__dashboard_section_csr > div:nth-child(2) {
            display: none !important;
          }
          #barcode-scanner__camera_permission_button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 12px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
          }
          #barcode-scanner__dashboard_section_swaplink {
            display: none !important;
          }
          #barcode-scanner__dashboard_section_csr > span {
            display: none !important;
          }
          #barcode-scanner video {
            border-radius: 12px !important;
          }
          #barcode-scanner__scan_region {
            margin-bottom: 0 !important;
          }
          #barcode-scanner select {
            padding: 8px !important;
            border-radius: 8px !important;
            border: 1px solid #e2e8f0 !important;
            margin-bottom: 12px !important;
            width: 100% !important;
            background: white !important;
          }
          #barcode-scanner__header_message {
            display: none !important;
          }
        `
        document.head.appendChild(style)

        scanner.render(
          (decodedText) => {
            console.log('Scanned barcode:', decodedText)
            scanner.clear().then(() => {
              onScanRef.current(decodedText)
            }).catch(console.error)
          },
          (errorMessage) => {
            // Log scan errors for debugging
            if (!errorMessage.includes('NotFound') && !errorMessage.includes('NotFoundException')) {
              console.log('Scan error:', errorMessage)
            }
          }
        )
        console.log('Scanner rendered successfully')
        setIsReady(true)
      } catch (err: any) {
        console.error('Failed to initialize scanner:', err)
        setError(err.message || 'Failed to initialize camera. Please check camera permissions.')
      }
    }, 500) // Increased delay to ensure DOM is ready

    return () => {
      clearTimeout(initTimeout)
      isMounted = false;

      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(console.error)
        } catch (e) {
          console.log('Scanner cleanup error:', e)
        }
        scannerRef.current = null
      }

      const styles = document.querySelectorAll('[data-scanner-styles]')
      styles.forEach(style => style.remove())
    }
  }, []) // Remove onScan dependency to prevent re-initialization

  const handleManualInput = () => {
    const barcode = prompt('Введите штрих-код вручную:')
    if (barcode && barcode.trim()) {
      onScan(barcode.trim())
      onClose()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '480px',
        minHeight: '600px',
        backgroundColor: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        animation: 'fadeInScale 0.3s ease-out'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="white" />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <Barcode size={24} />
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: 0
            }}>
              Сканирование штрих-кода
            </h3>
          </div>
          <p style={{
            fontSize: '14px',
            opacity: 0.9,
            margin: 0
          }}>
            Наведите камеру на штрих-код товара
          </p>
        </div>

        <div style={{
          padding: '20px',
          background: '#f8f9fa',
          minHeight: '350px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div id="barcode-scanner" style={{ minHeight: '280px' }}></div>

          {!isReady && !error && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#64748b',
              fontSize: '14px'
            }}>
              Инициализация камеры...
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fee',
              color: '#c00',
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </div>

        <div style={{
          padding: '20px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            <Camera size={16} />
            <span>Держите штрих-код в рамке</span>
          </div>

          <button
            onClick={handleManualInput}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#667eea',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            Ввести штрих-код вручную
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}