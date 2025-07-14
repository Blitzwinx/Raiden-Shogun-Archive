import React, { useState, useRef } from 'react';
import { Image, Bold, Italic, List, Link, Settings } from 'lucide-react';
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

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
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

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 p-3 bg-gray-800 border border-purple-500/30 rounded-lg">
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('\n- ', '')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertText('[', '](url)')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-600"></div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !postId}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={editExistingImage}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Edit Selected Image Size"
        >
          <Settings className="h-4 w-4" />
        </button>
        {isUploading && (
          <span className="text-sm text-purple-400">Uploading to cloud...</span>
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
          className="w-full px-4 py-3 bg-gray-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 min-h-[300px] resize-vertical"
          placeholder="Write your content here... You can use Markdown formatting and drag & drop images."
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
          Supports Markdown • Drag & drop images • Cloud storage • Resizable images
        </div>
      </div>

      {/* Image Size Selection Modal */}
      {imageSizeModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-purple-500/30 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Choose Image Size</h3>
            
            {/* Image Preview */}
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <img 
                src={imageSizeModal.imageUrl} 
                alt={imageSizeModal.altText}
                className="w-full h-32 object-cover rounded"
              />
              <p className="text-sm text-gray-400 mt-2 truncate">{imageSizeModal.altText}</p>
            </div>

            {/* Size Options */}
            <div className="space-y-2 mb-4">
              {imageSizes.filter(size => size.value !== 'custom').map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleSizeSelection(size.value)}
                  className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-purple-500/30 hover:border-purple-400/50 rounded-lg transition-colors"
                >
                  <div className="font-medium text-white">{size.label}</div>
                  <div className="text-sm text-gray-400">Max width: {size.width}</div>
                </button>
              ))}
              
              {/* Custom Size Option */}
              <div className="p-3 bg-gray-800 border border-purple-500/30 rounded-lg">
                <div className="font-medium text-white mb-2">Custom Size</div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g., 400px, 50%, 20rem"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
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
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    Apply
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Examples: 300px, 50%, 25rem, 80vw
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setImageSizeModal({ isOpen: false, imageUrl: '', altText: '', currentSize: 'medium' })}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
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

      {/* Help text */}
      <div className="text-sm text-gray-400 space-y-1">
        <p><strong>Formatting tips:</strong></p>
        <p>• **bold text** • *italic text* • [link text](url)</p>
        <p>• Images: Upload via button or drag & drop • Choose size after upload</p>
        <p>• Edit existing images: Select the image and click the settings button</p>
        <p>• Max image size: 5MB • Supported: JPG, PNG, GIF, WebP</p>
      </div>
    </div>
  );
};

export default RichTextEditor;