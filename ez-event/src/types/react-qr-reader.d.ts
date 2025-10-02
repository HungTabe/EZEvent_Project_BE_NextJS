declare module 'react-qr-reader' {
  import * as React from 'react';
  export interface QrReaderProps {
    constraints?: MediaTrackConstraints;
    onResult?: (result: unknown) => void;
    videoStyle?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
  }
  export const QrReader: React.ComponentType<QrReaderProps>;
  const Default: React.ComponentType<QrReaderProps>;
  export default Default;
}

