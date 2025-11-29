import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Contact Us</h1>
        <p style={styles.subtitle}>
          Have questions about Secure Drive 3.0? We're here to help!
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.contactInfo}>
          <h2 style={styles.sectionTitle}>Get in Touch</h2>
          <p style={styles.sectionDescription}>
            Our team is always ready to assist you with any questions 
            about our blockchain-based file storage solution.
          </p>
          
          <div style={styles.contactMethods}>
            <div style={styles.contactMethod}>
              <Mail size={24} color="#667eea" />
              <div>
                <h3>Email</h3>
                <p>support@securedrive.com</p>
              </div>
            </div>
            
            <div style={styles.contactMethod}>
              <Phone size={24} color="#667eea" />
              <div>
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div style={styles.contactMethod}>
              <MapPin size={24} color="#667eea" />
              <div>
                <h3>Office</h3>
                <p>123 Blockchain Street<br />Web3 City, 10001</p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.contactForm}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label htmlFor="name" style={styles.label}>Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="subject" style={styles.label}>Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter the subject"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="message" style={styles.label}>Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                style={styles.textarea}
                placeholder="Tell us how we can help you..."
                rows="6"
              />
            </div>

            <button 
              type="submit" 
              disabled={sending}
              style={{
                ...styles.submitButton,
                ...(sending ? styles.submitButtonDisabled : {})
              }}
            >
              <Send size={20} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#666',
    maxWidth: '600px',
    margin: '0 auto'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    alignItems: 'start'
  },
  contactInfo: {
    padding: '2rem'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#333'
  },
  sectionDescription: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  contactMethods: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  contactMethod: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem'
  },
  contactForm: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease'
  },
  textarea: {
    padding: '12px 16px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '16px',
    resize: 'vertical',
    minHeight: '120px',
    transition: 'border-color 0.3s ease',
    fontFamily: 'inherit'
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.3s ease'
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
};

export default Contact;