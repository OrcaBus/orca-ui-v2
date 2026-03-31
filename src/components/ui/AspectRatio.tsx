'use client';

function AspectRatio({
  ratio = 1,
  style,
  ...props
}: React.ComponentProps<'div'> & { ratio?: number }) {
  return (
    <div data-slot='aspect-ratio' style={{ ...style, aspectRatio: String(ratio) }} {...props} />
  );
}

export { AspectRatio };
