'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    if (baseUrl.includes('?')) {
      const [basePath, search] = baseUrl.split('?');
      const params = new URLSearchParams(search);
      if (page === 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      const qs = params.toString();
      return qs ? `${basePath}?${qs}` : basePath;
    }

    const cleanBase = baseUrl ? baseUrl.replace(/\/page\/\d+\/?$/, '') : '';
    if (page === 1) {
      return cleanBase ? `${cleanBase}/` : '/';
    }
    return `${cleanBase}/page/${page}/`;
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className="pagination-wrap" aria-label="Page navigation" style={{ marginTop: '32px', marginBottom: '16px' }}>
      <ul className="flex items-center justify-center gap-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        
        {/* Previous Button (Only rendered if previous page exists) */}
        {currentPage > 1 && (
          <li>
            <Link
              href={getPageUrl(currentPage - 1)}
              className="pagination-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px', marginRight: '4px' }} /> Prev
            </Link>
          </li>
        )}

        {/* Page Number Buttons */}
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <li key={p}>
              <Link
                href={getPageUrl(p)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #0066ff' : '1px solid #cbd5e1',
                  backgroundColor: isActive ? '#0066ff' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {p}
              </Link>
            </li>
          );
        })}

        {/* Next Button (Only rendered if next page exists) */}
        {currentPage < totalPages && (
          <li>
            <Link
              href={getPageUrl(currentPage + 1)}
              className="pagination-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Next <ChevronRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
            </Link>
          </li>
        )}

      </ul>
    </nav>
  );
}
