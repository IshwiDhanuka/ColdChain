import { useEffect, useRef, useCallback } from 'react'

export function useQRScanner({ onResult, onError }) {
  const readerRef = useRef(null)
  const videoRef    = useRef(null)
  const startingRef = useRef(false)

  async function createReader() {
    const ZXing = await import('@zxing/library')
    const hints = new Map()
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.QR_CODE])
    return new ZXing.BrowserQRCodeReader(hints)
  }

  const start = useCallback(async (videoEl) => {
    if (startingRef.current || readerRef.current) return true
    if (!videoEl) return false

    startingRef.current = true
    videoRef.current = videoEl
    try {
      const reader = await createReader()
      readerRef.current = reader

      await reader.decodeFromConstraints({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }, videoEl, (result) => {
        if (result) {
          reader.reset()
          readerRef.current = null
          onResult(result.getText())
        }
      })
      return true
    } catch (err) {
      readerRef.current?.reset()
      readerRef.current = null
      let msg = 'Could not access camera.'
      if (err?.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access.'
      else if (err?.name === 'NotFoundError') msg = 'No camera found on this device.'
      else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        msg = 'Camera requires HTTPS. Open the deployed HTTPS link or use localhost.'
      }
      onError(msg)
      return false
    } finally {
      startingRef.current = false
    }
  }, [onResult, onError])

  const stop = useCallback(() => {
    readerRef.current?.reset()
    readerRef.current = null
  }, [])

  const scanImage = useCallback(async (file) => {
    if (!file) return false
    const objectUrl = URL.createObjectURL(file)
    try {
      const reader = await createReader()
      const result = await reader.decodeFromImage(undefined, objectUrl)
      onResult(result.getText())
      return true
    } catch (err) {
      onError('Could not read a QR code from that image.')
      return false
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }, [onResult, onError])

  useEffect(() => () => { stop() }, [stop])

  return { start, stop, scanImage }
}

export function isQRSupported() {
  return !!(navigator?.mediaDevices?.getUserMedia)
}
