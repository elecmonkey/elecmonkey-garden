import * as React from 'react';

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> & {
  src: string;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function Image({
  fill,
  priority,
  loading,
  style,
  width,
  height,
  ...props
}: ImageProps) {
  const imageStyle: React.CSSProperties = fill
    ? { ...style, position: 'absolute', inset: 0, width: '100%', height: '100%' }
    : { ...style };

  return (
    <img
      {...props}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? 'eager' : loading}
      style={imageStyle}
    />
  );
}
