"use client";

import React, { useState } from 'react';
import { mockIndianElectionData } from '@/data/indianElections';
import { ShieldCheck, ShieldAlert, Volume2, Search, Sparkles, Loader2, Send } from 'lucide-react';
import { askGemini } from '@/app/actions/gemini';
import styles from './page.module.css';

/**
 * MYTH BUSTER PAGE
 * ----------------
 * This page serves two purposes:
 * 1. A curated list of static election myths with A11Y features (Text-to-Speech).
 * 2. An AI-powered assistant for real-time myth debunking and civic queries.
 */
export default function Myths() {
  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('');     // Filters the static myth list
  const [speakingId, setSpeakingId] = useState<string | null>(null); // Tracks active TTS
  const [aiQuery, setAiQuery] = useState('');           // The user's AI input
  const [aiResponse, setAiResponse] = useState<string | null>(null); // Gemini's response
  const [isAiLoading, setIsAiLoading] = useState(false); // UI loading state
  const [aiError, setAiError] = useState<string | null>(null); // Error handling for AI

  /**
   * AI INTERACTION HANDLER
   * ----------------------
   * Sends the user's rumor or query to the askGemini server action.
   */
  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    // Call the server action (utilizes Google Cloud Vertex AI)
    const result = await askGemini(aiQuery);
    
    if (result.error) {
      setAiError(result.error);
    } else {
      setAiResponse(result.answer);
    }
    setIsAiLoading(false);
  };

  // Logic to filter the local myth database based on user input
  const filteredMyths = mockIndianElectionData.myths.filter(
    (m) => m.myth.toLowerCase().includes(searchTerm.toLowerCase()) || 
           m.fact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * ACCESSIBILITY: TEXT-TO-SPEECH (TTS)
   * ----------------------------------
   * Uses the Web Speech API to provide audio accessibility for low-literacy users.
   * Includes fallback logic for Indian English voices.
   * 
   * @param id - Unique identifier for the item being read.
   * @param text - The content to read aloud.
   */
  const speak = (id: string, text: string) => {
    // 1. Browser Support Check
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Your browser does not support speech synthesis.");
      return;
    }
    
    // 2. Control Logic: Toggle speech off if the same button is clicked again
    window.speechSynthesis.cancel();
    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }

    // 3. Configuration: Set up the utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 4. Voice Selection: Optimization for the Indian context
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') 
                        || voices.find(v => v.lang.startsWith('en'))
                        || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1.0;
    
    // 5. Lifecycle Management
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = (event) => {
      console.error("Web Speech API Error:", event);
      setSpeakingId(null);
    };
    
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`container ${styles.mythsContainer}`}>
      {/* Header & Search */}
      <div className={styles.header}>
        <h1>Myth Buster</h1>
        <p>Protect your vote by separating fact from fiction. Understand common misconceptions about the election process.</p>
        
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Search myths or keywords..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search myths"
          />
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className={styles.aiSection}>
        <div className={styles.aiCard}>
          <div className={styles.aiHeader}>
            <Sparkles className={styles.aiIcon} size={24} />
            <h2>AI Civic Assistant</h2>
            <p>Have a specific question or heard a rumor? Ask our AI assistant for an instant, verified explanation.</p>
          </div>

          <form onSubmit={handleAiAsk} className={styles.aiForm}>
            <input 
              type="text" 
              placeholder="e.g., Can I vote if my name is missing from the list?" 
              className={styles.aiInput}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              disabled={isAiLoading}
            />
            <button 
              type="submit" 
              className={styles.aiSubmit} 
              disabled={isAiLoading || !aiQuery.trim()}
            >
              {isAiLoading ? <Loader2 className={styles.spin} size={20} /> : <Send size={20} />}
            </button>
          </form>

          {/* AI Response Display */}
          {(aiResponse || aiError) && (
            <div className={`${styles.aiResult} ${aiError ? styles.aiError : ''}`}>
              <div className={styles.aiResultHeader}>
                <Sparkles size={16} />
                <span>AI RESPONSE</span>
              </div>
              <p className={styles.aiText}>{aiResponse || aiError}</p>
              {aiResponse && (
                <button 
                  className={styles.aiSpeakBtn}
                  onClick={() => speak('ai-response', aiResponse)}
                  aria-label="Read AI response aloud"
                >
                  <Volume2 size={16} />
                  <span>Read Aloud</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Static Myths List */}
      <div className={styles.mythsGrid}>
        {filteredMyths.length > 0 ? (
          filteredMyths.map((item) => (
            <div key={item.id} className={styles.mythCard}>
              <button 
                className={`${styles.speakBtn} ${speakingId === item.id ? styles.speaking : ''}`}
                onClick={() => speak(item.id, `Myth: ${item.myth}. Fact: ${item.fact}`)}
                aria-label={speakingId === item.id ? "Stop reading aloud" : "Read aloud"}
                title="Read aloud"
              >
                <Volume2 size={20} />
              </button>
              
              <div className={styles.mythSection}>
                <div className={styles.iconWrapperMyth}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className={styles.labelMyth}>THE MYTH</h3>
                  <p className={styles.textMyth}>{item.myth}</p>
                </div>
              </div>
              
              <div className={styles.factSection}>
                <div className={styles.iconWrapperFact}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className={styles.labelFact}>THE FACT</h3>
                  <p className={styles.textFact}>{item.fact}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No myths found for "{searchTerm}". Try a different keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
}

