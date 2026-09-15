'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://rrbgroupdanswerkey.rusikakisku.workers.dev';
      const res = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('Failed to send message');
      }
      setSubmitted(true);
    } catch (_) {
      setErrorMsg('Failed to send your message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '30px' }}>
      <div className="page-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="page-head-title">Contact Us</h1>
        <div className="page-head-bar"></div>
        <div className="page-content">
          <p>Have any questions, concerns, or feedback? Please fill out the contact form below, and we will get back to you within 24–48 hours.</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontWeight: 600, margin: '16px 0' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {submitted ? (
          <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontWeight: 600, margin: '20px 0' }}>
            ✅ Thank you for reaching out! Your message has been sent successfully. We will get back to you within 24–48 hours.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Your Name</label>
              <input type="text" name="name" id="name" className="form-control" placeholder="Enter your full name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input type="email" name="email" id="email" className="form-control" placeholder="Enter your email address" required />
            </div>
            <div className="form-group">
              <label htmlFor="subject" className="form-label">Subject</label>
              <input type="text" name="subject" id="subject" className="form-control" placeholder="Enter subject of your message" required />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="form-label">Your Message</label>
              <textarea name="message" id="message" className="form-control" rows={6} placeholder="Write your message here..." required></textarea>
            </div>
            <div style={{ marginTop: '10px' }}>
              <button type="submit" className="btn btn-red" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Message →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
