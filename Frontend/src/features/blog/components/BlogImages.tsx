interface BlogImagesProps {
  imageUrls: string[];
}

export default function BlogImages({ imageUrls }: BlogImagesProps) {
  if (!imageUrls.length) return null;
  return (
    <div className="space-y-2">
      {imageUrls.map((url, i) => (
        <img key={i} src={url} alt={`blog-img-${i}`} className="w-full rounded" />
      ))}
    </div>
  );
}