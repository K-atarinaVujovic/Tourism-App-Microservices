import ReactMarkdown from "react-markdown";

interface BlogHeaderProps {
  title: string;
  description: string;
}

export default function BlogHeader({ title, description }: BlogHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-center">Blog</h1>
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="text-sm prose prose-sm max-w-none">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
    </div>
  );
}