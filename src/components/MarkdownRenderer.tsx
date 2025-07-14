import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = (text: string) => {
    // Split content by lines to process each line
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      // HTML Images with inline styles (for sized images)
      if (line.match(/<img[^>]+>/)) {
        const imgMatch = line.match(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*style="([^"]*)"[^>]*>/);
        if (imgMatch) {
          elements.push(
            <div key={index} className="my-4">
              <img
                src={imgMatch[1]}
                alt={imgMatch[2]}
                style={{ 
                  ...parseInlineStyles(imgMatch[3]),
                  display: 'block',
                  margin: '0 auto'
                }}
                className="shadow-lg"
                loading="lazy"
              />
            </div>
          );
          return;
        }
      }
      
      // Standard Markdown Images: ![alt](url)
      if (line.match(/!\[.*?\]\(.*?\)/)) {
        const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (imageMatch) {
          elements.push(
            <div key={index} className="my-4">
              <img
                src={imageMatch[2]}
                alt={imageMatch[1]}
                className="max-w-full h-auto rounded-lg shadow-lg mx-auto block"
                style={{ maxWidth: '500px' }}
                loading="lazy"
              />
            </div>
          );
          return;
        }
      }
      
      // Headers: # ## ###
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-bold text-white mt-6 mb-3">
            {line.substring(4)}
          </h3>
        );
        return;
      }
      
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
        return;
      }
      
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold text-white mt-6 mb-4">
            {line.substring(2)}
          </h1>
        );
        return;
      }
      
      // Lists: - item
      if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="text-gray-300 ml-4 mb-1">
            {processInlineFormatting(line.substring(2))}
          </li>
        );
        return;
      }
      
      // Empty lines
      if (line.trim() === '') {
        elements.push(<br key={index} />);
        return;
      }
      
      // Regular paragraphs
      elements.push(
        <p key={index} className="text-gray-300 mb-3 leading-relaxed">
          {processInlineFormatting(line)}
        </p>
      );
    });
    
    return elements;
  };
  
  const parseInlineStyles = (styleString: string): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    const declarations = styleString.split(';');
    
    declarations.forEach(declaration => {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        // Convert CSS property names to camelCase for React
        const camelCaseProperty = property.replace(/-([a-z])/g, (letter) => letter.toUpperCase());
        (styles as any)[camelCaseProperty] = value;
      }
    });
    
    return styles;
  };
  
  const processInlineFormatting = (text: string) => {
    // Process bold, italic, and links
    const parts = [];
    let currentText = text;
    let key = 0;
    
    while (currentText.length > 0) {
      // Bold: **text**
      const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        const beforeBold = currentText.substring(0, boldMatch.index);
        if (beforeBold) parts.push(<span key={key++}>{beforeBold}</span>);
        parts.push(<strong key={key++} className="font-bold text-white">{boldMatch[1]}</strong>);
        currentText = currentText.substring((boldMatch.index || 0) + boldMatch[0].length);
        continue;
      }
      
      // Italic: *text*
      const italicMatch = currentText.match(/\*(.*?)\*/);
      if (italicMatch) {
        const beforeItalic = currentText.substring(0, italicMatch.index);
        if (beforeItalic) parts.push(<span key={key++}>{beforeItalic}</span>);
        parts.push(<em key={key++} className="italic text-purple-300">{italicMatch[1]}</em>);
        currentText = currentText.substring((italicMatch.index || 0) + italicMatch[0].length);
        continue;
      }
      
      // Links: [text](url)
      const linkMatch = currentText.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const beforeLink = currentText.substring(0, linkMatch.index);
        if (beforeLink) parts.push(<span key={key++}>{beforeLink}</span>);
        parts.push(
          <a 
            key={key++} 
            href={linkMatch[2]} 
            className="text-purple-400 hover:text-purple-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        );
        currentText = currentText.substring((linkMatch.index || 0) + linkMatch[0].length);
        continue;
      }
      
      // No more formatting found, add the rest
      parts.push(<span key={key++}>{currentText}</span>);
      break;
    }
    
    return parts;
  };
  
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;