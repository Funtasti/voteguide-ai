"use client";

import React, { useState } from 'react';
import { mockIndianElectionData } from '@/data/indianElections';
import { ShieldCheck, ShieldAlert, Volume2, Search, Sparkles, Loader2, Send } from 'lucide-react';
import { askGemini } from '@/app/actions/gemini';
import styles from './page.module.css';

export default function Myths() {
  const [searchTerm, setSearchTerm] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    const result = await askGemini(aiQuery);
    
    if (result.error) {
      setAiError(result.error);
    } else {
      setAiResponse(result.answer);
    }
    setIsAiLoading(false);
  };

  const filteredMyths = mockIndianElectionData.myths.filter(
    (m) => m.myth.toLowerCase().includes(searchTerm.toLowerCase()) || 
           m.fact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const speak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Your browser does not support speech synthesis.");
      return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find an Indian English voice, fallback to any English voice, or system default
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

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = (event) => {
      console.error("SpeechSynthesis error:", event);
      setSpeakingId(null);
    };
    
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`container ${styles.mythsContainer}`}>
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
