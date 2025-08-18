import ReactMarkdown from 'react-markdown';

interface MessageFormatterProps {
  content: string;
  isAI: boolean;
}

export const MessageFormatter = ({ content, isAI }: MessageFormatterProps) => {
  if (!isAI) {
    // Keep user messages as plain text with line breaks
    return <p className="whitespace-pre-line">{content}</p>;
  }

  // Render AI messages with Markdown parsing
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-blue-200">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-gray-200">{children}</li>,
        h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-medium mb-1 text-white">{children}</h3>,
        code: ({ children }) => (
          <code className="bg-gray-800 px-1 py-0.5 rounded text-sm text-blue-200">
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-2">
            {children}
          </blockquote>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
