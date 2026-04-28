import { useEffect, useRef, useCallback } from 'react'

export function useQRScanner({ onResult, onError }) {
  const controlsRef = useRef(null)
  const videoRef    = useRef(null)

  const start = useCallback(async (videoEl) => {
    videoRef.current = videoEl
    try {
      // Dynamically import ZXing to avoid SSR issues
      const ZXing = await import('@zxing/library')
      const hints = new Map()
      hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.QR_CODE])
      const reader = new ZXing.BrowserQRCodeReader(hints)

      const devices = await ZXing.BrowserCodeReader.listVideoInputDevices()
      let deviceId = devices[0]?.deviceId
      const rear = devices.find(d => /(back|rear|environment)/i.test(d.label))
      if (rear) deviceId = rear.deviceId

      controlsRef.current = await reader.decodeFromVideoDevice(deviceId, videoEl, (result) => {
        if (result) onResult(result.getText())
      })
    } catch (err) {
      let msg = 'Could not access camera.'
      if (err?.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access.'
      else if (err?.name === 'NotFoundError') msg = 'No camera found on this device.'
      onError(msg)
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
