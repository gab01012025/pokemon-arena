'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function BattlePage() {
  const router = useRouter();
  const params = useParams();
  const battleId = params.battleId as string;

  useEffect(() => {
    // Check if this is an AI battle redirect
    if (battleId === 'ai' || battleId?.startsWith('ai-')) {
      router.replace('/battle/ai');
    }
  }, [battleId, router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        textAlign: 'center',
        border: '2px solid #444',
      }}>
        <h1 style={{ 
          color: '#e91e63', 
          fontSize: '2rem', 
          marginBottom: '20px',
          textShadow: '0 0 10px rgba(233, 30, 99, 0.5)',
        }}>
          Batalha Multiplayer
        </h1>
        
        <div style={{ 
          background: 'rgba(255, 193, 7, 0.1)', 
          border: '1px solid #FFC107',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '30px',
        }}>
          <p style={{ color: '#FFC107', fontSize: '1.1rem', margin: 0 }}>
            O modo Multiplayer PvP está em desenvolvimento!
          </p>
        </div>

        <p style={{ color: '#aaa', marginBottom: '30px', lineHeight: '1.6' }}>
          Em breve você poderá batalhar contra outros jogadores em tempo real!
          Por enquanto, experimente o modo de batalha contra a IA.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link 
            href="/battle/ai"
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              background: 'linear-gradient(135deg, #e91e63, #c2185b)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(233, 30, 99, 0.4)',
              transition: 'transform 0.2s ease',
            }}
          >
            🤖 Batalhar contra IA
          </Link>

          <Link 
            href="/play"
            style={{
              display: 'inline-block',
              padding: '12px 25px',
              background: 'transparent',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              border: '2px solid #555',
              fontWeight: 'bold',
            }}
          >
            ← Voltar para Seleção
          </Link>
        </div>
      </div>
    </div>
  );
}
