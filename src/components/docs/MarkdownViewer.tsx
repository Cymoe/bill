import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MarketingHeader } from '../marketing/MarketingHeader';
import { markdownToHtml } from '../../../utils/markdownToHtml';
import './MarkdownViewer.css';

// Styled component for the markdown content following the Construction Business Tool Design System
const MarkdownViewer: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { filename } = useParams<{ filename: string }>();

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/docs/${filename}.md`);
        if (!response.ok) {
          throw new Error(`Failed to load markdown file: ${response.statusText}`);
        }
        const text = await response.text();
        setContent(markdownToHtml(text));
      } catch (error) {
        console.error('Error loading markdown:', error);
        setContent('<p class="text-warning-red">Error loading document. Please try again later.</p>');
      } finally {
        setIsLoading(false);
      }
    };

    if (filename) {
      fetchMarkdown();
    }
  }, [filename]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <MarketingHeader />
      <div className="max-w-5xl mx-auto p-8 mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div 
            className="markdown-content" 
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownViewer;
