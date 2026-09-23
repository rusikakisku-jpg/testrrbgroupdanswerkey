'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/lib/types';

interface CommentSectionProps {
  postId: number;
  initialComments: Comment[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Live sync approved comments on mount in background
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev';
    fetch(`${apiBase}/api/comments?post_id=${postId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setComments(data);
        }
      })
      .catch(() => {});
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !authorEmail || !content) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev';
      const res = await fetch(`${apiBase}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          author_name: authorName,
          author_email: authorEmail,
          content,
        }),
      });

      if (res.ok) {
        const newComm: Comment = {
          id: Date.now(),
          post_id: postId,
          parent_id: 0,
          author_name: authorName,
          author_email: authorEmail,
          content,
          status: 'approved',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        setComments([newComm, ...comments]);
        setContent('');
        setSuccessMsg('Your comment has been submitted successfully!');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg('Failed to submit comment. Please try again.');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit comment. Please try again.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #eeeeee' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111111', marginBottom: '20px' }}>
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#111111', marginBottom: '6px' }}>
              Name *
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="form-control"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#111111', marginBottom: '6px' }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#111111', marginBottom: '6px' }}>
            Comment *
          </label>
          <textarea
            rows={4}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-red"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>

        {successMsg && (
          <p style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, marginTop: '10px' }}>
            {successMsg}
          </p>
        )}
        {errorMsg && (
          <p style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 600, marginTop: '10px' }}>
            {errorMsg}
          </p>
        )}
      </form>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#777777', fontStyle: 'italic' }}>No comments yet.</p>
        ) : (
          comments.map((comm) => (
            <div key={comm.id} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '4px', border: '1px solid #eeeeee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111111' }}>{comm.author_name}</span>
                <span style={{ fontSize: '0.78rem', color: '#777777' }}>{comm.created_at}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#555555', lineHeight: 1.6 }}>{comm.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
