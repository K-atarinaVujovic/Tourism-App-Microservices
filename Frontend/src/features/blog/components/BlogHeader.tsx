import ReactMarkdown from "react-markdown";

interface BlogHeaderProps {
  title: string;
  description: string;
  authorId: number;
}

export default function BlogHeader({ title, description, authorId }: BlogHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-center">Blog</h1>
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-xs text-muted-foreground">Author ID: {authorId}</p>
      <div className="text-sm prose prose-sm max-w-none prose-headings:whitespace-normal prose-pre:overflow-visible prose-p:text-white prose-headings:text-white prose-strong:text-white">
        <ReactMarkdown>{description}</ReactMarkdown>
      </div>
    </div>
  );
}