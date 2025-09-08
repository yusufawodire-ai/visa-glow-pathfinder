import ReactMarkdown from 'react-markdown';

interface MessageFormatterProps {
  content: string;
  isAI: boolean;
  textColor?: string;
}

export const MessageFormatter = ({ content, isAI, textColor = "text-white" }: MessageFormatterProps) => {
  if (!isAI) {
    // Keep user messages as plain text with line breaks
    return <p className={`whitespace-pre-line ${textColor}`}>{content}</p>;
  }

  // Render AI messages with Markdown parsing
  return (
    <div className="max-w-none">
      <ReactMarkdown
        components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-visa-gold">{children}</strong>,
        em: ({ children }) => <em className="italic text-visa-light-lilac">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-white">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-white">{children}</ol>,
        li: ({ children }) => <li className="text-white">{children}</li>,
        h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-visa-gold">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-visa-gold">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-medium mb-1 text-visa-gold">{children}</h3>,
        code: ({ children }) => (
          <code className="bg-visa-dark-gray px-1 py-0.5 rounded text-sm text-visa-light-lilac">
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-visa-gold pl-4 italic text-white my-2">
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
