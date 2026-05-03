import { useEffect, useRef, useCallback } from 'react'

export function useQRScanner({ onResult, onError }) {
  const controlsRef = useRef(null)
  const videoRef    = useRef(null)
  const startingRef = useRef(false)

  const start = useCallback(async (videoEl) => {
    if (startingRef.current || controlsRef.current) return true
    if (!videoEl) return false

    startingRef.current = true
    videoRef.current = videoEl
    try {
      // Dynamically import ZXing to avoid SSR issues
      const ZXing = await import('@zxing/library')
      const hints = new Map()
      hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.QR_CODE])
      const reader = new ZXing.BrowserQRCodeReader(hints)

      const devices = await ZXing.BrowserCodeReader.listVideoInputDevices()
      if (!devices.length) {
        const error = new Error('No camera found on this device.')
        error.name = 'NotFoundError'
        throw error
      }
      let deviceId = devices[0]?.deviceId
      const rear = devices.find(d => /(back|rear|environment)/i.test(d.label))
      if (rear) deviceId = rear.deviceId

      controlsRef.current = await reader.decodeFromVideoDevice(deviceId, videoEl, (result) => {
        if (result) onResult(result.getText())
      })
      return true
    } catch (err) {
      let msg = 'Could not access camera.'
      if (err?.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access.'
      else if (err?.name === 'NotFoundError') msg = 'No camera found on this device.'
      onError(msg)
      return false
    } finally {
      startingRef.current = false
    }
  }, [onResult, onError])

  const stop = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
  }, [])

  useEffect(() => () => { stop() }, [stop])

  return { start, stop }
}

export function isQRSupported() {
  return !!(navigator?.mediaDevices?.getUserMedia)
}
