interface BlogHeaderProps {
  title: string;
  description: string;
}

export default function BlogHeader({ title, description }: BlogHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-center">Blog</h1>
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm">{description}</p>
    </div>
  );
}