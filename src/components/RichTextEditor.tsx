import React, { useState, useRef } from 'react';
import { 
  Image, Bold, Italic, List, Link, Settings, 
  Minus, Sparkles, AlignLeft, AlignCenter, AlignRight,
  Type, ChevronDown
} from 'lucide-react';
import { imageService } from '../services/imageService';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  postId?: number;
}

interface ImageSizeModal {
  isOpen: boolean;
  imageUrl: string;
  altText: string;
  currentSize: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, postId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [imageSizeModal, setImageSizeModal] = useState<ImageSizeModal>({
    isOpen: false,
    imageUrl: '',
    altText: '',
    currentSize: 'medium'
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageSizes = [
    { value: 'small', label: 'Small (300px)', width: '300px' },
    { value: 'medium', label: 'Medium (500px)', width: '500px' },
    { value: 'large', label: 'Large (700px)', width: '700px' },
    { value: 'full', label: 'Full Width (100%)', width: '100%' },
    { value: 'custom', label: 'Custom Size', width: 'custom' }
  ];

  const fontSizes = [
    { value: 'xs', label: 'Extra Small', class: 'text-xs' },
    { value: 'sm', label: 'Small', class: 'text-sm' },
    { value: 'base', label: 'Normal', class: 'text-base' },
    { value: 'lg', label: 'Large', class: 'text-lg' },
    { value: 'xl', label: 'Extra Large', class: 'text-xl' },
    { value: '2xl', label: 'XX Large', class: 'text-2xl' },
    { value: '3xl', label: 'XXX Large', class: 'text-3xl' }
  ];

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Restore cursor position without scrolling
    requestAnimationFrame(() => {
      if (textarea) {
        const newStart = start + before.length;
        const newEnd = start + before.length + selectedText.length;
        textarea.setSelectionRange(newStart, newEnd);
        // Don't call focus() to prevent scrolling
      }
    });
  };

  const insertBlockElement = (element: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    // Add newlines before and after if needed
    const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
    const needsNewlineAfter = afterCursor.length > 0 && !afterCursor.startsWith('\n');
    
    const elementToInsert = 
      (needsNewlineBefore ? '\n' : '') + 
      element + 
      (needsNewlineAfter ? '\n' : '');
    
    const newText = beforeCursor + elementToInsert + afterCursor;
    onChange(newText);

    // Position cursor after the inserted element without scrolling
    requestAnimationFrame(() => {
      if (textarea) {
        const newPosition = start + elementToInsert.length;
        textarea.setSelectionRange(newPosition, newPosition);
        // Don't call focus() to prevent scrolling
      }
    });
  };

  const insertAlignment = (alignment: 'left' | 'center' | 'right') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText.trim()) {
      // Wrap selected text
      insertText(`[align=${alignment}]`, `[/align]`);
    } else {
      // Insert empty alignment tags
      const before = `[align=${alignment}]`;
      const after = `[/align]`;
      const newText = value.substring(0, start) + before + after + value.substring(end);
      onChange(newText);
      
      // Position cursor between tags without scrolling
      requestAnimationFrame(() => {
        if (textarea) {
          const newPosition = start + before.length;
          textarea.setSelectionRange(newPosition, newPosition);
          // Don't call focus() to prevent scrolling
        }
      });
    }
  };

  const insertFontSize = (size: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText.trim()) {
      // Wrap selected text
      insertText(`[size=${size}]`, `[/size]`);
    } else {
      // Insert empty size tags
      const before = `[size=${size}]`;
      const after = `[/size]`;
      const newText = value.substring(0, start) + before + after + value.substring(end);
      onChange(newText);
      
      // Position cursor between tags without scrolling
      requestAnimationFrame(() => {
        if (textarea) {
          const newPosition = start + before.length;
          textarea.setSelectionRange(newPosition, newPosition);
          // Don't call focus() to prevent scrolling
        }
      });
    }
    
    setShowFontSizeDropdown(false);
  };

  const insertImageWithSize = (imageUrl: string, altText: string, size: string, customWidth?: string) => {
    let imageMarkdown = '';
    
    if (size === 'custom' && customWidth) {
      imageMarkdown = `\n<img src="${imageUrl}" alt="${altText}" style="max-width: ${customWidth}; height: auto; border-radius: 8px;" />\n`;
    } else if (size === 'full') {
      imageMarkdown = `\n<img src="${imageUrl}" alt="${altText}" style="width: 100%; height: auto; border-radius: 8px;" />\n`;
    } else {
      const sizeConfig = imageSizes.find(s => s.value === size);
      const width = sizeConfig?.width || '500px';
      imageMarkdown = `\n<img src="${imageUrl}" alt="${altText}" style="max-width: ${width}; height: auto; border-radius: 8px;" />\n`;
    }
    
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const newValue = value.substring(0, cursorPos) + imageMarkdown + value.substring(cursorPos);
      onChange(newValue);
      
      // Position cursor after the inserted image without scrolling
      requestAnimationFrame(() => {
        if (textarea) {
          const newPosition = cursorPos + imageMarkdown.length;
          textarea.setSelectionRange(newPosition, newPosition);
          // Don't call focus() to prevent scrolling
        }
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const imageData = await imageService.uploadImage(file, postId || 0, file.name);
      
      // Open size selection modal
      setImageSizeModal({
        isOpen: true,
        imageUrl: imageData.public_url,
        altText: imageData.alt_text || file.name,
        currentSize: 'medium'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSizeSelection = (size: string, customWidth?: string) => {
    insertImageWithSize(imageSizeModal.imageUrl, imageSizeModal.altText, size, customWidth);
    setImageSizeModal({ isOpen: false, imageUrl: '', altText: '', currentSize: 'medium' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const editExistingImage = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // Check if selection contains an image (either markdown or HTML)
    const markdownImageMatch = selectedText.match(/!\[(.*?)\]\((.*?)\)/);
    const htmlImageMatch = selectedText.match(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/);

    if (markdownImageMatch) {
      setImageSizeModal({
        isOpen: true,
        imageUrl: markdownImageMatch[2],
        altText: markdownImageMatch[1],
        currentSize: 'medium'
      });
    } else if (htmlImageMatch) {
      setImageSizeModal({
        isOpen: true,
        imageUrl: htmlImageMatch[1],
        altText: htmlImageMatch[2],
        currentSize: 'medium'
      });
    } else {
      alert('Please select an image in your text to edit its size. Select the entire image markdown or HTML tag.');
    }
  };

  // Handle dropdown toggle without affecting textarea focus
  const toggleFontSizeDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowFontSizeDropdown(!showFontSizeDropdown);
  };

  // Handle button clicks without affecting textarea focus
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    action();
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-800 border border-purple-500/30 rounded-lg">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertText('**', '**'))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertText('*', '*'))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={toggleFontSizeDropdown}
            className="flex items-center space-x-1 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Font Size"
          >
            <Type className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
          
          {showFontSizeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-purple-500/30 rounded-lg shadow-lg z-10 min-w-[140px]">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onMouseDown={(e) => handleButtonClick(e, () => insertFontSize(size.value))}
                  className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className={`${size.class} text-container`}>{size.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertAlignment('left'))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertAlignment('center'))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertAlignment('right'))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

        {/* Lists and Links */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertText('\n- ', ''))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertText('[', '](url)'))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Link"
          >
            <Link className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

        {/* Section Dividers */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertBlockElement('[divider-simple]'))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Simple Divider"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => insertBlockElement('[divider-gradient]'))}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Gradient Divider"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-600"></div>

        {/* Images */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, () => fileInputRef.current?.click())}
            disabled={isUploading || !postId}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            title="Insert Image"
          >
            <Image className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => handleButtonClick(e, editExistingImage)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Edit Selected Image Size"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {isUploading && (
          <span className="text-xs sm:text-sm text-purple-400 text-container">Uploading to cloud...</span>
        )}
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 min-h-[250px] sm:min-h-[300px] resize-vertical text-sm sm:text-base text-container"
          placeholder="Write your content here... You can use Markdown formatting, custom alignment, font sizes, section dividers, and drag & drop images."
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-500 text-container hidden sm:block">
          Enhanced formatting • Section dividers • Text alignment • Font sizes • Cloud storage
        </div>
      </div>

      {/* Image Size Selection Modal */}
      {imageSizeModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-purple-500/30 rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 text-container">Choose Image Size</h3>
            
            {/* Image Preview */}
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <img 
                src={imageSizeModal.imageUrl} 
                alt={imageSizeModal.altText}
                className="w-full h-32 object-cover rounded"
              />
              <p className="text-xs sm:text-sm text-gray-400 mt-2 truncate text-container">{imageSizeModal.altText}</p>
            </div>

            {/* Size Options */}
            <div className="space-y-2 mb-4">
              {imageSizes.filter(size => size.value !== 'custom').map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleSizeSelection(size.value)}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-purple-500/30 hover:border-purple-400/50 rounded-lg transition-colors"
                >
                  <div className="font-medium text-white text-sm sm:text-base text-container">{size.label}</div>
                  <div className="text-xs sm:text-sm text-gray-400 text-container">Max width: {size.width}</div>
                </button>
              ))}
              
              {/* Custom Size Option */}
              <div className="p-3 bg-gray-800 border border-purple-500/30 rounded-lg">
                <div className="font-medium text-white mb-2 text-sm sm:text-base text-container">Custom Size</div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g., 400px, 50%, 20rem"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 text-sm text-container"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          handleSizeSelection('custom', input.value.trim());
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      if (input.value.trim()) {
                        handleSizeSelection('custom', input.value.trim());
                      }
                    }}
                    className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm text-container"
                  >
                    Apply
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-container">
                  Examples: 300px, 50%, 25rem, 80vw
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setImageSizeModal({ isOpen: false, imageUrl: '', altText: '', currentSize: 'medium' })}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm sm:text-base text-container"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Enhanced Help text */}
      <div className="text-xs sm:text-sm text-gray-400 space-y-2 text-container">
        <p><strong>Enhanced Formatting Options:</strong></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <p>• **bold** • *italic* • [link](url)</p>
            <p>• Font sizes: XS to XXX-Large</p>
            <p>• Text alignment: Left, Center, Right</p>
          </div>
          <div>
            <p>• Section dividers: Simple & Gradient</p>
            <p>• Images: Upload, resize, drag & drop</p>
            <p>• Max image size: 5MB • Cloud storage</p>
          </div>
        </div>
        <p><strong>Usage:</strong> Select text and click formatting buttons, or use buttons to insert elements at cursor position.</p>
      </div>

      {/* Click outside to close dropdown */}
      {showFontSizeDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onMouseDown={() => setShowFontSizeDropdown(false)}
        />
      )}
    </div>
  );
};

export default RichTextEditor;