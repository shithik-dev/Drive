import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Upload, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import FeatureCard from '../components/FeatureCard';
import AnimatedButton from '../components/AnimatedButton';

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

  const steps = [
    {
      number: '1',
      title: 'Sign Up & Connect Wallet',
      description: 'Create your account and connect your MetaMask wallet'
    },
    {
      number: '2',
      title: 'Upload Files',
      description: 'Select files and sign the transaction with MetaMask'
    },
    {
      number: '3',
      title: 'Secure Storage',
      description: 'Files are stored on IPFS and hashes recorded on blockchain'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-blue">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block p-6 bg-cyan-500/20 rounded-3xl mb-8"
              >
                <Shield size={80} className="text-cyan-400" />
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 glow-text">
                Secure Your Files with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Blockchain Technology
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Secure Drive 3.0 combines the power of Ethereum blockchain and IPFS 
                to provide the most secure and decentralized file storage solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <AnimatedButton variant="primary" className="text-lg px-8 py-4">
                    Get Started Free
                    <ArrowRight size={20} />
                  </AnimatedButton>
                </Link>
                <Link to="/dashboard">
                  <AnimatedButton variant="outline" className="text-lg px-8 py-4">
                    Try Demo
                  </AnimatedButton>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose Secure Drive 3.0?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the future of secure file storage
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-blue-alt">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="glass p-8 rounded-xl text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white"
                >
                  {step.number}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 text-center max-w-3xl mx-auto border border-cyan-500/30"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Secure Your Files?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of users who trust Secure Drive 3.0 for their file storage needs
            </p>
            <Link to="/signup">
              <AnimatedButton variant="primary" className="text-lg px-8 py-4">
                Get Started Now
                <ArrowRight size={20} />
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
