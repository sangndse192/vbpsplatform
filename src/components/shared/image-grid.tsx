"use client";

type Props = {
  images: string[];
};

export function ImageGrid({ images }: Props) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg">
        <img src={images[0]} alt="" className="w-full max-h-80 object-cover" />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-48 object-cover" />
        ))}
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
        <img src={images[0]} alt="" className="col-span-1 row-span-2 w-full h-full object-cover" />
        <img src={images[1]} alt="" className="w-full h-24 object-cover" />
        <img src={images[2]} alt="" className="w-full h-24 object-cover" />
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
      {images.slice(0, 4).map((src, i) => (
        <img key={i} src={src} alt="" className="w-full h-36 object-cover" />
      ))}
    </div>
  );
}
