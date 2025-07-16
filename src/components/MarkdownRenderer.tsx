import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const processCustomElements = (text: string): string => {
    let processedText = text;

    // Process alignment blocks: [align=center]content[/align]
    processedText = processedText.replace(
      /\[align=(left|center|right)\]([\s\S]*?)\[\/align\]/g,
      (match, alignment, content) => {
        let alignmentClass;
        switch (alignment) {
          case 'left':
            alignmentClass = 'text-left';
            break;
          case 'center':
            alignmentClass = 'text-center';
            break;
          case 'right':
            alignmentClass = 'text-right';
            break;
          default:
            alignmentClass = 'text-left';
        }
        return `<div class="${alignmentClass}">${content.trim()}</div>`;
      }
    );

    // Process font size blocks: [size=lg]content[/size]
    processedText = processedText.replace(
      /\[size=(xs|sm|base|lg|xl|2xl|3xl)\]([\s\S]*?)\[\/size\]/g,
      (match, size, content) => {
        const sizeClass = `text-${size}`;
        return `<span class="${sizeClass}">${content.trim()}</span>`;
      }
    );

    return processedText;
  };

  const parseInlineStyles = (styleString: string): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    const declarations = styleString.split(';');
    
    declarations.forEach(declaration => {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        // Convert CSS property names to camelCase for React
        const camelCaseProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        (styles as any)[camelCaseProperty] = value;
      }
    });
    
    return styles;
  };

  const processInlineFormatting = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let currentText = text;
    let key = 0;
    
    while (currentText.length > 0) {
      // Bold: **text**
      const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        const beforeBold = currentText.substring(0, boldMatch.index);
        if (beforeBold) parts.push(beforeBold);
        parts.push(<strong key={key++} className="font-bold text-white">{boldMatch[1]}</strong>);
        currentText = currentText.substring((boldMatch.index || 0) + boldMatch[0].length);
        continue;
      }
      
      // Italic: *text*
      const italicMatch = currentText.match(/\*(.*?)\*/);
      if (italicMatch) {
        const beforeItalic = currentText.substring(0, italicMatch.index);
        if (beforeItalic) parts.push(beforeItalic);
        parts.push(<em key={key++} className="italic text-purple-300">{italicMatch[1]}</em>);
        currentText = currentText.substring((italicMatch.index || 0) + italicMatch[0].length);
        continue;
      }
      
      // Links: [text](url)
      const linkMatch = currentText.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const beforeLink = currentText.substring(0, linkMatch.index);
        if (beforeLink) parts.push(beforeLink);
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
      parts.push(currentText);
      break;
    }
    
    return parts;
  };

  const renderCustomHTML = (htmlString: string): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let key = 0;
    let remaining = htmlString;
    
    while (remaining.length > 0) {
      // Check for div with class (alignment)
      const divMatch = remaining.match(/<div class="([^"]*)">(.*?)<\/div>/s);
      if (divMatch) {
        const [fullMatch, className, innerContent] = divMatch;
        const beforeDiv = remaining.substring(0, divMatch.index);
        
        // Add any content before the div
        if (beforeDiv.trim()) {
          elements.push(<span key={key++}>{processInlineFormatting(beforeDiv)}</span>);
        }
        
        // Process the div content
        elements.push(
          <div key={key++} className={className} style={className === 'text-right' ? { textAlign: 'right' } : undefined}>
            {innerContent.includes('<span class=') 
              ? renderCustomHTML(innerContent)
              : processInlineFormatting(innerContent)
            }
          </div>
        );
        
        // Continue with remaining content
        remaining = remaining.substring((divMatch.index || 0) + fullMatch.length);
        continue;
      }
      
      // Check for span with class (font size)
      const spanMatch = remaining.match(/<span class="([^"]*)">(.*?)<\/span>/s);
      if (spanMatch) {
        const [fullMatch, className, innerContent] = spanMatch;
        const beforeSpan = remaining.substring(0, spanMatch.index);
        
        // Add any content before the span
        if (beforeSpan.trim()) {
          elements.push(<span key={key++}>{processInlineFormatting(beforeSpan)}</span>);
        }
        
        // Process the span content
        elements.push(
          <span key={key++} className={className}>
            {innerContent.includes('<div class=') || innerContent.includes('<span class=')
              ? renderCustomHTML(innerContent)
              : processInlineFormatting(innerContent)
            }
          </span>
        );
        
        // Continue with remaining content
        remaining = remaining.substring((spanMatch.index || 0) + fullMatch.length);
        continue;
      }
      
      // No more HTML tags found, process remaining content
      if (remaining.trim()) {
        elements.push(<span key={key++}>{processInlineFormatting(remaining)}</span>);
      }
      break;
    }
    
    return elements;
  };



  const renderMarkdown = (text: string): JSX.Element[] => {
    // First, process custom elements to convert them to HTML
    const processedContent = processCustomElements(text);
    
    // Split into lines for processing
    const lines = processedContent.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Handle empty lines - count consecutive empty lines for spacing
      if (line.trim() === '') {
        let emptyLineCount = 0;
        let tempIndex = i;
        
        // Count consecutive empty lines
        while (tempIndex < lines.length && lines[tempIndex].trim() === '') {
          emptyLineCount++;
          tempIndex++;
        }
        
        // Look ahead to see if there's content after these empty lines
        let hasContentAfter = false;
        for (let j = tempIndex; j < lines.length; j++) {
          if (lines[j].trim() !== '') {
            hasContentAfter = true;
            break;
          }
        }
        
        // Add spacing if we have content before and after empty lines
        if (elements.length > 0 && hasContentAfter) {
          // Create spacing based on number of empty lines
          // Each empty line adds 1rem of margin-bottom
          const spacingClass = emptyLineCount === 1 ? 'mb-4' : 
                              emptyLineCount === 2 ? 'mb-8' : 
                              emptyLineCount === 3 ? 'mb-12' : 
                              emptyLineCount === 4 ? 'mb-16' : 
                              emptyLineCount >= 5 ? 'mb-20' : 'mb-4';
          
          elements.push(<div key={key++} className={spacingClass}></div>);
        }
        
        // Skip all the empty lines we just processed
        i = tempIndex;
        continue;
      }

      // Custom dividers
      if (line.trim() === '[divider-simple]') {
        elements.push(
          <div key={key++} className="section-divider-simple my-6"></div>
        );
        i++;
        continue;
      }

      if (line.trim() === '[divider-gradient]') {
        elements.push(
          <div key={key++} className="section-divider my-8"></div>
        );
        i++;
        continue;
      }

      // Check if line contains custom HTML elements
      if (line.includes('<div class=') || line.includes('<span class=')) {
        const htmlElements = renderCustomHTML(line);
        elements.push(...htmlElements.map(el => React.cloneElement(el, { key: key++ })));
        i++;
        continue;
      }

      // HTML Images with inline styles (for sized images)
      if (line.match(/<img[^>]+>/)) {
        const imgMatch = line.match(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*style="([^"]*)"[^>]*>/);
        if (imgMatch) {
          elements.push(
            <div key={key++} className="my-6 text-center">
              <img
                src={imgMatch[1]}
                alt={imgMatch[2]}
                style={{ 
                  ...parseInlineStyles(imgMatch[3]),
                  display: 'block',
                  margin: '0 auto'
                }}
                className="shadow-lg rounded-lg"
                loading="lazy"
              />
            </div>
          );
          i++;
          continue;
        }
      }
      
      // Standard Markdown Images: ![alt](url)
      if (line.match(/!\[.*?\]\(.*?\)/)) {
        const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (imageMatch) {
          elements.push(
            <div key={key++} className="my-6 text-center">
              <img
                src={imageMatch[2]}
                alt={imageMatch[1]}
                className="max-w-full h-auto rounded-lg shadow-lg mx-auto block"
                style={{ maxWidth: '500px' }}
                loading="lazy"
              />
            </div>
          );
          i++;
          continue;
        }
      }
      
      // Headers: # ## ###
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-lg sm:text-xl font-bold text-white mt-6 mb-3 text-container">
            {processInlineFormatting(line.substring(4))}
          </h3>
        );
        i++;
        continue;
      }
      
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 text-container">
            {processInlineFormatting(line.substring(3))}
          </h2>
        );
        i++;
        continue;
      }
      
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-2xl sm:text-3xl font-bold text-white mt-6 mb-4 text-container">
            {processInlineFormatting(line.substring(2))}
          </h1>
        );
        i++;
        continue;
      }
      
      // Lists: - item
      if (line.startsWith('- ')) {
        elements.push(
          <li key={key++} className="text-sm sm:text-base text-gray-300 ml-4 mb-1 text-container leading-relaxed">
            {processInlineFormatting(line.substring(2))}
          </li>
        );
        i++;
        continue;
      }
      
      // Regular paragraphs - group consecutive non-empty lines
      const paragraphLines = [];
      while (i < lines.length && lines[i].trim() !== '' && 
             !lines[i].startsWith('#') && !lines[i].startsWith('- ') &&
             !lines[i].includes('<div class=') && !lines[i].includes('<span class=') &&
             !lines[i].match(/!\[.*?\]\(.*?\)/) && !lines[i].match(/<img[^>]+>/) &&
             lines[i].trim() !== '[divider-simple]' && lines[i].trim() !== '[divider-gradient]') {
        paragraphLines.push(lines[i]);
        i++;
      }
      
      if (paragraphLines.length > 0) {
        elements.push(
          <p key={key++} className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed text-container">
            {paragraphLines.map((paragraphLine, index) => (
              <React.Fragment key={index}>
                {processInlineFormatting(paragraphLine)}
                {index < paragraphLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      }
    }
    
    return elements;
  };
  
  return (
    <div className={`prose prose-invert max-w-none text-container ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;