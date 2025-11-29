import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Upload, Globe, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Shield size={48} />,
      title: 'Blockchain Security',
      description: 'Every file upload is digitally signed and recorded on the Ethereum blockchain for maximum security and transparency.'
    },
    {
      icon: <Lock size={48} />,
      title: 'Decentralized Storage',
      description: 'Files are stored on IPFS (InterPlanetary File System), ensuring censorship-resistant and distributed storage.'
    },
    {
      icon: <Upload size={48} />,
      title: 'Easy File Management',
      description: 'Create folders and organize your files with our intuitive Google Drive-like interface.'
    },
    {
      icon: <Globe size={48} />,
      title: 'Global Access',
      description: 'Access your files from anywhere in the world with our secure, cloud-based platform.'
    }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div className="container">
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Secure Your Files with Blockchain Technology
            </h1>
            <p style={styles.heroSubtitle}>
              Secure Drive 3.0 combines the power of Ethereum blockchain and IPFS 
              to provide the most secure and decentralized file storage solution.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/signup" className="btn btn-primary">
                Get Started Free
              </Link>
              <Link to="/dashboard" className="btn btn-secondary">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Why Choose Secure Drive 3.0?</h2>
          <div className="grid grid-3">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div style={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.howItWorks}>
        <div className="container">
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <h3>Sign Up & Connect Wallet</h3>
              <p>Create your account and connect your MetaMask wallet</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <h3>Upload Files</h3>
              <p>Select files and sign the transaction with MetaMask</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <h3>Secure Storage</h3>
              <p>Files are stored on IPFS and hashes recorded on blockchain</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '100px 0',
    textAlign: 'center'
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: '1.2'
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    marginBottom: '2.5rem',
    opacity: 0.9
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  features: {
    padding: '80px 0',
    background: '#f8f9fa'
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '3rem',
    color: '#333'
  },
  featureIcon: {
    color: '#667eea',
    marginBottom: '1.5rem'
  },
  featureTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#333'
  },
  featureDescription: {
    color: '#666',
    lineHeight: '1.6'
  },
  howItWorks: {
    padding: '80px 0'
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '3rem',
    textAlign: 'center'
  },
  step: {
    padding: '2rem'
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 auto 1.5rem'
  }
};

export default Home;