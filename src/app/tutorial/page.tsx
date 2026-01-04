'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  image?: string;
  action?: string;
  actionLink?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Bem-vindo ao Pokémon Arena!',
    description: 'Este é um jogo de batalhas estratégicas onde você monta seu time de Pokémon e enfrenta outros treinadores. Vamos aprender como funciona!',
    image: '🎮',
  },
  {
    id: 2,
    title: 'Monte seu Time',
    description: 'Você pode ter até 3 Pokémon no seu time de batalha. Escolha sabiamente considerando tipos, habilidades e estratégias!',
    image: '👥',
    action: 'Montar Time',
    actionLink: '/select-team',
  },
  {
    id: 3,
    title: 'Entenda os Tipos',
    description: 'Cada Pokémon tem um ou dois tipos (Fogo, Água, Grama, etc). Tipos são importantes! Fogo > Grama > Água > Fogo. Use isso a seu favor!',
    image: '🔥💧🌿',
  },
  {
    id: 4,
    title: 'Sistema de Energia',
    description: 'Cada turno você ganha energia para usar golpes. Golpes poderosos custam mais energia. Administre sua energia com sabedoria!',
    image: '⚡',
  },
  {
    id: 5,
    title: 'Golpes e Habilidades',
    description: 'Cada Pokémon tem 4 golpes únicos. Alguns causam dano, outros dão buff/debuff, e alguns afetam vários alvos!',
    image: '💥',
    action: 'Ver Pokémon',
    actionLink: '/characters',
  },
  {
    id: 6,
    title: 'Batalhe contra a IA',
    description: 'Comece treinando contra a IA! É uma ótima forma de aprender sem pressão e ganhar XP para subir de nível.',
    image: '🤖',
    action: 'Batalhar vs IA',
    actionLink: '/battle/ai',
  },
  {
    id: 7,
    title: 'Complete Missões',
    description: 'Missões diárias, semanais e de história dão XP e recompensas extras. Confira sempre suas missões!',
    image: '📋',
    action: 'Ver Missões',
    actionLink: '/missions',
  },
  {
    id: 8,
    title: 'Desbloqueie Novos Pokémon',
    description: 'Ganhe XP e use para desbloquear novos Pokémon! Quanto mais raros, mais poderosos e caros.',
    image: '🔓',
    action: 'Desbloquear Pokémon',
    actionLink: '/unlock-pokemon',
  },
  {
    id: 9,
    title: 'Entre em um Clã',
    description: 'Clãs são grupos de jogadores que batalham juntos! Entre em um clã para fazer amigos e competir no ranking de clãs.',
    image: '🏰',
    action: 'Ver Clãs',
    actionLink: '/clans',
  },
  {
    id: 10,
    title: 'Suba no Ranking!',
    description: 'Vença batalhas para ganhar Ladder Points e subir no ranking mundial. Os melhores ganham recompensas exclusivas!',
    image: '🏆',
    action: 'Ver Ranking',
    actionLink: '/ladder',
  },
];

export default function TutorialPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tutorialProgress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProgress(parsed);
      if (parsed.length === tutorialSteps.length) {
        setCompleted(true);
      }
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length) {
      const newProgress = [...progress, currentStep];
      setProgress(newProgress);
      localStorage.setItem('tutorialProgress', JSON.stringify(newProgress));
      setCurrentStep(currentStep + 1);
    } else {
      const newProgress = [...progress, currentStep];
      setProgress(newProgress);
      localStorage.setItem('tutorialProgress', JSON.stringify(newProgress));
      setCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  if (completed) {
    return (
      <div className="tutorial-page">
        <div className="tutorial-completed">
          <div className="completion-icon">🎉</div>
          <h1>Tutorial Completo!</h1>
          <p>Parabéns! Você está pronto para se tornar um Mestre Pokémon!</p>
          
          <div className="quick-links">
            <h3>Próximos passos:</h3>
            <div className="links-grid">
              <Link href="/select-team" className="quick-link">
                <span className="link-icon">👥</span>
                <span className="link-text">Montar Time</span>
              </Link>
              <Link href="/battle/ai" className="quick-link">
                <span className="link-icon">⚔️</span>
                <span className="link-text">Batalhar</span>
              </Link>
              <Link href="/missions" className="quick-link">
                <span className="link-icon">📋</span>
                <span className="link-text">Missões</span>
              </Link>
              <Link href="/unlock-pokemon" className="quick-link">
                <span className="link-icon">🔓</span>
                <span className="link-text">Desbloquear</span>
              </Link>
            </div>
          </div>

          <div className="completion-actions">
            <Link href="/" className="btn-primary">
              🏠 Voltar ao Início
            </Link>
            <button onClick={handleReset} className="btn-secondary">
              🔄 Refazer Tutorial
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutorial-page">
      <div className="tutorial-container">
        {/* Progress Bar */}
        <div className="tutorial-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / tutorialSteps.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {currentStep} de {tutorialSteps.length}
          </span>
        </div>

        {/* Step Indicators */}
        <div className="step-indicators">
          {tutorialSteps.map((s) => (
            <div 
              key={s.id}
              className={`step-indicator ${currentStep === s.id ? 'active' : ''} ${progress.includes(s.id) ? 'completed' : ''}`}
              onClick={() => setCurrentStep(s.id)}
            >
              {progress.includes(s.id) ? '✓' : s.id}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="tutorial-step">
          <div className="step-icon">{step.image}</div>
          <h2 className="step-title">{step.title}</h2>
          <p className="step-description">{step.description}</p>

          {step.action && step.actionLink && (
            <Link href={step.actionLink} className="step-action-btn">
              {step.action} →
            </Link>
          )}
        </div>

        {/* Navigation */}
        <div className="tutorial-navigation">
          <button 
            onClick={handlePrevious} 
            disabled={currentStep === 1}
            className="btn-nav btn-prev"
          >
            ← Anterior
          </button>

          <button onClick={handleSkip} className="btn-skip">
            Pular Tutorial
          </button>

          <button onClick={handleNext} className="btn-nav btn-next">
            {currentStep === tutorialSteps.length ? 'Concluir' : 'Próximo →'}
          </button>
        </div>

        {/* Tips */}
        <div className="tutorial-tips">
          <h4>💡 Dicas Rápidas:</h4>
          <ul>
            <li>Use a tecla &quot;Enter&quot; para avançar</li>
            <li>Clique nos números acima para navegar</li>
            <li>Visite as páginas recomendadas para aprender mais</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
