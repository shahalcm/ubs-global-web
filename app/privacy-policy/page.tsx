import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'UBS Global Privacy Policy',
  description: 'Privacy Policy for UBS Global Importing & Exporting',
};

interface PrivacyPolicyData {
  success: boolean;
  legalDoc: {
    title: string;
    content: string;
    updatedAt: string;
  };
}

// Safely formats the date string to a human-readable format
function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Custom parser to map markdown-like syntax to React elements safely (escaping all HTML natively)
function parseContent(text: string): React.ReactNode[] {
  if (!text) return [];

  // Normalize escaped newline characters
  const normalized = text.replace(/\\n/g, '\n');
  const lines = normalized.split('\n');
  
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc pl-6 mb-6 text-slate-600 space-y-2 text-sm sm:text-base">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const parseInlineStyles = (lineText: string, key: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const boldSplit = lineText.split('**');
    
    boldSplit.forEach((boldPart, bIdx) => {
      if (bIdx % 2 === 1) {
        // Bold segment
        const italicSplit = boldPart.split('*');
        italicSplit.forEach((italicPart, iIdx) => {
          if (iIdx % 2 === 1) {
            parts.push(
              <strong key={`b-i-${key}-${bIdx}-${iIdx}`} className="font-semibold text-slate-900 italic">
                {italicPart}
              </strong>
            );
          } else {
            parts.push(
              <strong key={`b-${key}-${bIdx}-${iIdx}`} className="font-semibold text-slate-955">
                {italicPart}
              </strong>
            );
          }
        });
      } else {
        // Normal segment
        const italicSplit = boldPart.split('*');
        italicSplit.forEach((italicPart, iIdx) => {
          if (iIdx % 2 === 1) {
            parts.push(
              <em key={`i-${key}-${bIdx}-${iIdx}`} className="italic text-slate-850">
                {italicPart}
              </em>
            );
          } else {
            parts.push(italicPart);
          }
        });
      }
    });

    return <span key={key}>{parts}</span>;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2 tracking-tight">
          {parseInlineStyles(line.slice(2), `h1-${i}`)}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">
          {parseInlineStyles(line.slice(3), `h2-${i}`)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-semibold text-slate-900 mt-6 mb-3 tracking-tight">
          {parseInlineStyles(line.slice(4), `h3-${i}`)}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${i}`} className="text-base sm:text-lg font-semibold text-slate-900 mt-4 mb-2">
          {parseInlineStyles(line.slice(5), `h4-${i}`)}
        </h4>
      );
    }
    // Lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      const listContent = line.slice(2);
      currentList.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {parseInlineStyles(listContent, `li-${i}`)}
        </li>
      );
    }
    // Paragraph
    else {
      flushList();
      elements.push(
        <p key={`p-${i}`} className="text-slate-600 leading-relaxed mb-6 text-sm sm:text-base text-justify font-normal">
          {parseInlineStyles(line, `p-${i}`)}
        </p>
      );
    }
  }

  flushList();
  return elements;
}

export default async function PrivacyPolicyPage() {
  // Fetch privacy policy with no-store cache configuration
  const response = await fetch('https://api.ubsglobalapp.com/api/users/legal-docs/privacy-policy', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load privacy policy. Server returned status: ${response.status}`);
  }

  const result: PrivacyPolicyData = await response.json();

  if (!result.success || !result.legalDoc) {
    throw new Error('Privacy policy request failed or returned empty content.');
  }

  const { title, content, updatedAt } = result.legalDoc;
  const parsedElements = parseContent(content);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Upper Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 shadow-sm transition-all duration-300">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3 group transition-transform duration-200">
            <img
              src="/logo.png"
              alt="UBS Global"
              className="h-10 w-auto object-contain cursor-pointer"
            />
            <span className="font-extrabold text-slate-800 tracking-tight hidden sm:inline text-lg group-hover:text-slate-900">
              UBS Global
            </span>
          </Link>
          
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors py-2 px-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-20">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          
          {/* Header Section */}
          <div className="border-b border-slate-100 pb-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              <Shield className="w-3.5 h-3.5" />
              Legal Document
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {title || 'Privacy Policy'}
            </h1>

            {updatedAt && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Last Updated:</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  {formatDate(updatedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Legal Body Text */}
          <article className="prose prose-slate max-w-none">
            {parsedElements}
          </article>

          {/* Footer Copyright */}
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
            <div>
              &copy; {new Date().getFullYear()} UBS Global Inc. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link href="/terms-and-conditions" className="hover:text-slate-600 transition-colors underline underline-offset-2">
                Terms of Service
              </Link>
              <Link href="/refund-policy" className="hover:text-slate-600 transition-colors underline underline-offset-2">
                Refund Policy
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
