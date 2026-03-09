export type CameraSupport = {
  hasGetUserMedia: boolean;
  isSecureContext: boolean;
  videoInputs: number;
};

export async function getCameraSupport(): Promise<CameraSupport> {
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const isSecureContext = window.isSecureContext;

  let videoInputs = 0;
  try {
    if (navigator.mediaDevices?.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      videoInputs = devices.filter((d) => d.kind === 'videoinput').length;
    }
  } catch {
    // ignore
  }

  return { hasGetUserMedia, isSecureContext, videoInputs };
}

export async function getCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    const e: any = new Error('getUserMedia is not supported');
    e.name = 'NotSupportedError';
    throw e;
  }

  // 1) Try preferred constraints (will not hard-fail if facingMode unsupported)
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: { ideal: 'user' },
      },
    });
  } catch (err: any) {
    const name = err?.name;

    // 2) Fallback to any available camera
    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      return await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    }

    throw err;
  }
}

export function mapCameraError(err: any, support?: CameraSupport | null): string {
  const name = err?.name;

  if (support && !support.isSecureContext) {
    return 'لا يمكن تشغيل الكاميرا إلا عبر HTTPS.';
  }

  if (name === 'NotSupportedError') {
    return 'هذا المتصفح لا يدعم تشغيل الكاميرا (getUserMedia).';
  }

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'تم رفض إذن الكاميرا. يرجى السماح بالوصول من إعدادات المتصفح.';
  }

  if (name === 'NotFoundError') {
    return 'لم يتم العثور على كاميرا على هذا الجهاز.';
  }

  if (name === 'NotReadableError') {
    return 'الكاميرا مستخدمة من تطبيق/تبويب آخر. أغلقه وحاول مجددًا.';
  }

  if (name === 'OverconstrainedError') {
    return 'إعدادات الكاميرا غير متوافقة. حاول مجددًا.';
  }

  return 'لم نتمكن من الوصول للكاميرا.';
}
