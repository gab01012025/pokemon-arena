'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LeftSidebar, RightSidebar } from '@/components/layout/Sidebar';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  action?: string;
  actionLink?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Bem-vindo ao Pokémon Arena!',
    description: 'Este é um jogo de batalhas estratégicas onde você monta seu time de Pokémon e enfrenta outros treinadores. Vamos aprender como funciona!',
  },
  {
    id: 2,
    title: 'Monte seu Time',
    description: 'Você pode ter até 3 Pokémon no seu time de batalha. Escolha sabiamente considerando tipos, habilidades e estratégias!',
    action: 'Montar Time',
    actionLink: '/select-team',
  },
  {
    id: 3,
    title: 'Entenda os Tipos',
    description: 'Cada Pokémon tem um ou dois tipos (Fogo, Água, Grama, etc). Tipos são importantes! Fogo > Grama > Água > Fogo. Use isso a seu favor!',
  },
  {
    id: 4,
    title: 'Sistema de Energia',
    description: 'Cada turno você ganha energia para usar golpes. Golpes poderosos custam mais energia. Administre sua energia com sabedoria!',
  },
  {
    id: 5,
    title: 'Golpes e Habilidades',
    description: 'Cada Pokémon tem 4 golpes únicos. Alguns causam dano, outros dão buff/debuff, e alguns afetam vários alvos!',
    action: 'Ver Pokémon',
    actionLink: '/characters',
  },
  {
    id: 6,
    title: 'Batalhe contra a IA',
    description: 'Comece treinando contra a IA! É uma ótima forma de aprender sem pressão e ganhar XP para subir de nível.',
    action: 'Batalhar vs IA',
    actionLink: '/battle/ai',
  },
  {
    id: 7,
    title: 'Complete Missões',
    description: 'Missões diárias, semanais e de história dão XP e recompensas extras. Confira sempre suas missões!',
    action: 'Ver Missões',
    actionLink: '/missions',
  },
  {
    id: 8,
    title: 'Desbloqueie Novos Pokémon',
    description: 'Ganhe XP e use para desbloquear novos Pokémon! Quanto mais raros, mais poderosos e caros.',
    action: 'Desbloquear Pokémon',
    actionLink: '/unlock-pokemon',
  },
  {
    id: 9,
    title: 'Entre em um Clã',
    description: 'Clãs são grupos de jogadores que batalham juntos! Entre em um clã para fazer amigos e competir no ranking de clãs.',
    action: 'Ver Clãs',
    actionLink: '/clans',
  },
  {
    id: 10,
    title: 'Suba no Ranking!',
    description: 'Vença batalhas para ganhar Ladder Points e subir no ranking mundial. Os melhores ganham recompensas exclusivas!',
    action: 'Ver Ranking',
    actionLink: '/ladder',
  },
];

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tutorialProgress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
        if (parsed.length === tutorialSteps.length) {
          setCompleted(true);
        }
      } catch { /* ignore */ }
    }
  }, []);

  const handleNext = () => {
    const newProgress = [...progress, currentStep];
    setProgress(newProgress);
    localStorage.setItem('tutorialProgress', JSON.stringify(newProgress));
    if (currentStep < tutorialSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    localStorage.setItem('tutorialProgress', JSON.stringify(tutorialSteps.map(s => s.id)));
    setCompleted(true);
  };

  const handleReset = () => {
    localStorage.removeItem('tutorialProgress');
    setProgress([]);
    setCurrentStep(1);
    setCompleted(false);
  };

  const step = tutorialSteps[currentStep - 1];
  const progressPercent = Math.round((currentStep / tutorialSteps.length) * 100);

  return (
    <div className="page-wrapper">
      <div className="main-container">
        <div className="header-section">
          <div className="header-left">
            <div className="nav-buttons-top">
              <Link href="/" className="nav-btn-top">Startpage</Link>
              <Link href="/play" className="nav-btn-top">Start Playing</Link>
              <Link href="/tutorial" className="nav-btn-top">Tutorial</Link>
              <Link href="/ladders" className="nav-btn-top">Ladders</Link>
              <Link href="/missions" className="nav-btn-top">Missões</Link>
              <Link href="/unlock-pokemon" className="nav-btn-top">Desbloquear</Link>
              <Link href="/my-clan" className="nav-btn-top">Meu Clã</Link>
            </div>
          </div>
          <div className="header-banner">
            <h1>POKEMON ARENA</h1>
          </div>
        </div>

        <LeftSidebar />

        <main className="center-content">
          <div className="content-box">
            <div className="content-box-header">
              <h2>Tutorial</h2>
            </div>
            <div className="content-box-body">
              {completed ? (
                /* Completion Screen */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <h3 style={{ color: '#22c55e', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                    Tutorial Completo!
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>
                    Parabéns! Você está pronto para se tornar um Mestre Pokémon!
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px' }}>
                    {[
                      { label: 'Montar Time', href: '/select-team' },
                      { label: 'Batalhar', href: '/battle/ai' },
                      { label: 'Missões', href: '/missions' },
                      { label: 'Desbloquear', href: '/unlock-pokemon' },
                    ].map(link => (
                      <Link key={link.href} href={link.href} style={{
                        padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#60a5fa', textDecoration: 'none', textAlign: 'center',
                      }}>
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <Link href="/" style={{
                      padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                      color: '#f87171', textDecoration: 'none',
                    }}>
                      Voltar ao Início
                    </Link>
                    <button onClick={handleReset} style={{
                      padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#94a3b8', cursor: 'pointer',
                    }}>
                      Refazer Tutorial
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Progresso</span>
                      <span style={{ fontSize: '10px', color: '#f59e0b' }}>{currentStep}/{tutorialSteps.length}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progressPercent}%`, height: '100%', borderRadius: '2px',
                        background: 'linear-gradient(90deg, #ef4444, #f59e0b)', transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>

                  {/* Step Indicators */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {tutorialSteps.map(s => {
                      const isActive = currentStep === s.id;
                      const isDone = progress.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => setCurrentStep(s.id)}
                          style={{
                            width: '26px', height: '26px', borderRadius: '50%', fontSize: '10px', fontWeight: 600,
                            border: isActive ? '2px solid #ef4444' : isDone ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                            background: isActive ? 'rgba(239,68,68,0.15)' : isDone ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                            color: isActive ? '#f87171' : isDone ? '#22c55e' : '#64748b',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {isDone ? '\u2713' : s.id}
                        </button>
                      );
                    })}
                  </div>

                  {/* Step Content */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px', padding: '24px', textAlign: 'center', marginBottom: '20px',
                  }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 12px',
                      background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', fontWeight: 700, color: '#f87171',
                    }}>
                      {step.id}
                    </div>
                    <h3 style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
                      {step.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto' }}>
                      {step.description}
                    </p>
                    {step.action && step.actionLink && (
                      <Link href={step.actionLink} style={{
                        display: 'inline-block', marginTop: '14px', padding: '8px 20px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: 600, textDecoration: 'none',
                        background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa',
                      }}>
                        {step.action}
                      </Link>
                    )}
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      style={{
                        padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        color: currentStep === 1 ? '#334155' : '#94a3b8',
                        cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Anterior
                    </button>
                    <button onClick={handleSkip} style={{
                      padding: '6px 14px', borderRadius: '6px', fontSize: '10px',
                      background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer',
                    }}>
                      Pular Tutorial
                    </button>
                    <button onClick={handleNext} style={{
                      padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                      color: '#f87171', cursor: 'pointer',
                    }}>
                      {currentStep === tutorialSteps.length ? 'Concluir' : 'Próximo'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
