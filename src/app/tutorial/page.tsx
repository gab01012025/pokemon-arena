'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './tutorial.css';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Pokemon Arena',
    subtitle: 'A strategic turn-based battle game',
    content: `Pokemon Arena is a competitive 3v3 turn-based strategy game. Build your team, manage energy,
    and outplay your opponents with smart skill usage and timing.`,
    tips: [
      'Every match is 3v3 - choose your team wisely',
      'Energy management is the key to victory',
      'Status effects can turn the tide of battle',
    ],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  },
  {
    id: 'team-building',
    title: 'Building Your Team',
    subtitle: 'Choose 3 Pokemon for battle',
    content: `Select 3 Pokemon from your collection to form your battle team. Consider type matchups,
    synergies between skills, and energy type requirements when building your squad.`,
    tips: [
      'Balance offensive and defensive Pokemon',
      'Avoid picking 3 Pokemon that need the same energy type',
      'Consider type coverage - Fire, Water, Grass covers most weaknesses',
      'Check skill cooldowns - some Pokemon have faster rotations',
    ],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
  },
  {
    id: 'energy-system',
    title: 'Energy System',
    subtitle: 'The fuel for your attacks',
    content: `Each turn you receive energy based on your alive Pokemon's types. Energy is used to pay for skills.
    There are 5 types: Fire, Water, Grass, Electric, and Colorless (universal).`,
    tips: [
      'You get 1 energy per alive Pokemon each turn',
      'Colorless energy can be used for any skill cost',
      'If a Pokemon faints, you lose that energy income',
      'Some skills drain or steal enemy energy',
    ],
    energyTypes: [
      { name: 'Fire', color: '#F08030', desc: 'Powers fire-type attacks' },
      { name: 'Water', color: '#6890F0', desc: 'Powers water-type attacks' },
      { name: 'Grass', color: '#78C850', desc: 'Powers grass-type attacks' },
      { name: 'Electric', color: '#F8D030', desc: 'Powers electric attacks' },
      { name: 'Colorless', color: '#A8A878', desc: 'Universal - works for any' },
    ],
  },
  {
    id: 'battle-mechanics',
    title: 'Battle Mechanics',
    subtitle: 'How combat works',
    content: `Each turn, you select one action per Pokemon (use a skill or pass). Both players act simultaneously.
    Skills have different targets, costs, cooldowns, and effects.`,
    tips: [
      'Actions resolve simultaneously - plan for what your opponent might do',
      'Each skill has a cooldown after use',
      'Skills can target: single enemy, all enemies, self, or ally',
      '"Invulnerable" prevents being targeted that turn',
      'Status effects persist for set durations',
    ],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
  },
  {
    id: 'status-effects',
    title: 'Status Effects',
    subtitle: 'Buffs, debuffs, and conditions',
    content: `Skills can apply various status effects that persist over multiple turns. Understanding these effects
    and how to use them (or counter them) is essential for high-level play.`,
    statuses: [
      { name: 'Burn', color: '#F08030', desc: 'Deals damage each turn, reduces attack' },
      { name: 'Poison', color: '#A040A0', desc: 'Deals increasing damage each turn' },
      { name: 'Freeze', color: '#98D8D8', desc: 'Prevents all actions for duration' },
      { name: 'Paralyze', color: '#F8D030', desc: '50% chance to skip action each turn' },
      { name: 'Stun', color: '#705848', desc: 'Prevents actions for 1 turn' },
      { name: 'Invulnerable', color: '#7038F8', desc: 'Cannot be targeted' },
      { name: 'Reflect', color: '#F85888', desc: 'Returns damage to attacker' },
      { name: 'Weaken', color: '#705898', desc: 'Reduces damage dealt' },
    ],
  },
  {
    id: 'winning',
    title: 'Path to Victory',
    subtitle: 'Win conditions and strategy',
    content: `Defeat all 3 of your opponent's Pokemon to win the battle. Earn experience, ladder points,
    and rewards. Climb the ranked ladder and become the ultimate Pokemon Champion!`,
    tips: [
      'Knock out all 3 enemy Pokemon to win',
      'Focus on eliminating their strongest threat first',
      'Managing energy advantage leads to winning positions',
      'Use invulnerability to dodge big attacks',
      'Status effects stack - burn + poison is devastating',
    ],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
  },
];

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div className="tut-page">
      <nav className="tut-nav">
        <Link href="/" className="tut-nav-back">&larr; Home</Link>
        <div className="tut-progress">
          <div className="tut-progress-bar">
            <div className="tut-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="tut-progress-text">{currentStep + 1}/{TUTORIAL_STEPS.length}</span>
        </div>
        <Link href="/play" className="tut-skip-btn">Skip to Game</Link>
      </nav>

      <div className="tut-content">
        {/* Step Navigation Dots */}
        <div className="tut-dots">
          {TUTORIAL_STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`tut-dot ${i === currentStep ? 'tut-dot-active' : ''} ${i < currentStep ? 'tut-dot-done' : ''}`}
              onClick={() => setCurrentStep(i)}
              title={s.title}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="tut-step" key={step.id}>
          <div className="tut-step-header">
            <span className="tut-step-subtitle">{step.subtitle}</span>
            <h1 className="tut-step-title">{step.title}</h1>
          </div>

          <div className="tut-step-body">
            {step.image && (
              <div className="tut-step-image">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={160}
                  height={160}
                  unoptimized
                />
              </div>
            )}

            <p className="tut-step-content">{step.content}</p>

            {/* Tips */}
            {step.tips && (
              <div className="tut-tips">
                <h3 className="tut-tips-title">Key Points</h3>
                <ul className="tut-tips-list">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="tut-tip-item">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Energy Types */}
            {step.energyTypes && (
              <div className="tut-energy-grid">
                {step.energyTypes.map(energy => (
                  <div key={energy.name} className="tut-energy-item">
                    <div className="tut-energy-orb" style={{ background: energy.color }} />
                    <div className="tut-energy-info">
                      <span className="tut-energy-name">{energy.name}</span>
                      <span className="tut-energy-desc">{energy.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Status Effects */}
            {step.statuses && (
              <div className="tut-status-grid">
                {step.statuses.map(status => (
                  <div key={status.name} className="tut-status-item">
                    <span className="tut-status-dot" style={{ background: status.color }} />
                    <span className="tut-status-name">{status.name}</span>
                    <span className="tut-status-desc">{status.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="tut-nav-buttons">
          <button
            className="tut-btn tut-btn-prev"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </button>

          {currentStep < TUTORIAL_STEPS.length - 1 ? (
            <button
              className="tut-btn tut-btn-next"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          ) : (
            <Link href="/play" className="tut-btn tut-btn-play">
              Start Playing!
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
