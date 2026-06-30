'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Check,
  X,
  Sparkles,
  Wind,
  ShieldCheck,
  Globe,
  ListChecks,
  Scale,
  Mic,
  Anchor,
  Wrench,
} from 'lucide-react';

// "Image" here is a gradient + icon illustration standing in for an
// AI-generated image (e.g. from an image-gen API) — keeps the demo fast,
// reliable, and license-free while preserving the visual slot.
const vocabWords = [
  {
    id: 1,
    word: 'Ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    pos: 'adjective',
    definition: 'Lasting for a very short time.',
    example: 'Fame on social media can be ephemeral, vanishing as quickly as it arrived.',
    synonyms: ['Fleeting', 'Transient', 'Momentary'],
    antonyms: ['Permanent', 'Enduring', 'Eternal'],
    icon: Wind,
    artGradient: 'bg-gradient-to-br from-violet-400 to-indigo-600',
    mastery: 'learning',
  },
  {
    id: 2,
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.i.ənt/',
    pos: 'adjective',
    definition: 'Able to recover quickly from difficult conditions.',
    example: 'The local economy proved resilient, rebounding within months of the downturn.',
    synonyms: ['Tough', 'Adaptable', 'Hardy'],
    antonyms: ['Fragile', 'Vulnerable', 'Delicate'],
    icon: ShieldCheck,
    artGradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    mastery: 'mastered',
  },
  {
    id: 3,
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    pos: 'adjective',
    definition: 'Present, appearing, or found everywhere.',
    example: 'Smartphones have become ubiquitous in classrooms around the world.',
    synonyms: ['Omnipresent', 'Widespread', 'Pervasive'],
    antonyms: ['Rare', 'Scarce', 'Uncommon'],
    icon: Globe,
    artGradient: 'bg-gradient-to-br from-indigo-400 to-indigo-700',
    mastery: 'new',
  },
  {
    id: 4,
    word: 'Meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    pos: 'adjective',
    definition: 'Showing great attention to detail; very careful and precise.',
    example: 'Her meticulous notes made it easy to review the entire semester before the exam.',
    synonyms: ['Precise', 'Thorough', 'Painstaking'],
    antonyms: ['Careless', 'Sloppy', 'Hasty'],
    icon: ListChecks,
    artGradient: 'bg-gradient-to-br from-amber-400 to-amber-600',
    mastery: 'mastered',
  },
  {
    id: 5,
    word: 'Ambivalent',
    phonetic: '/æmˈbɪv.ə.lənt/',
    pos: 'adjective',
    definition: 'Having mixed or contradictory feelings about something.',
    example: "He felt ambivalent about the move — excited for the opportunity, but sad to leave his friends.",
    synonyms: ['Conflicted', 'Uncertain', 'Torn'],
    antonyms: ['Decisive', 'Certain', 'Resolute'],
    icon: Scale,
    artGradient: 'bg-gradient-to-br from-rose-400 to-rose-600',
    mastery: 'learning',
  },
  {
    id: 6,
    word: 'Eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    pos: 'adjective',
    definition: 'Fluent and persuasive in speaking or writing.',
    example: "The student's eloquent essay impressed the admissions committee.",
    synonyms: ['Articulate', 'Persuasive', 'Expressive'],
    antonyms: ['Inarticulate', 'Awkward', 'Tongue-tied'],
    icon: Mic,
    artGradient: 'bg-gradient-to-br from-violet-400 to-violet-700',
    mastery: 'new',
  },
  {
    id: 7,
    word: 'Tenacious',
    phonetic: '/təˈneɪ.ʃəs/',
    pos: 'adjective',
    definition: 'Holding firmly to a course of action despite obstacles.',
    example: 'Her tenacious approach to studying paid off when her score jumped 150 points.',
    synonyms: ['Persistent', 'Determined', 'Unyielding'],
    antonyms: ['Submissive', 'Irresolute', 'Yielding'],
    icon: Anchor,
    artGradient: 'bg-gradient-to-br from-amber-500 to-rose-600',
    mastery: 'mastered',
  },
  {
    id: 8,
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    pos: 'adjective',
    definition: 'Dealing with things sensibly and realistically.',
    example: 'Rather than panicking, the teacher took a pragmatic approach to the schedule change.',
    synonyms: ['Practical', 'Realistic', 'Sensible'],
    antonyms: ['Idealistic', 'Impractical', 'Unrealistic'],
    icon: Wrench,
    artGradient: 'bg-gradient-to-br from-indigo-400 to-violet-600',
    mastery: 'learning',
  },
];

const masteryStyles = {
  new: { badge: 'bg-slate-100 text-slate-500', label: 'New', dot: 'bg-slate-300' },
  learning: { badge: 'bg-amber-100 text-amber-700', label: 'Learning', dot: 'bg-amber-400' },
  mastered: { badge: 'bg-emerald-100 text-emerald-700', label: 'Mastered', dot: 'bg-emerald-500' },
};

export default function VocabBuilder() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastery, setMastery] = useState(() =>
    Object.fromEntries(vocabWords.map((w) => [w.id, w.mastery]))
  );

  const word = vocabWords[index];
  const Icon = word.icon;
  const masteredCount = Object.values(mastery).filter((m) => m === 'mastered').length;

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % vocabWords.length);
  };

  const goPrev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + vocabWords.length) % vocabWords.length);
  };

  const goToIndex = (i) => {
    setFlipped(false);
    setIndex(i);
  };

  const markMastery = (level) => {
    setMastery((prev) => ({ ...prev, [word.id]: level }));
    goNext();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 max-w-md mx-auto lg:max-w-none lg:mx-0">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vocabulary Builder</h1>
          <p className="text-sm text-slate-500 mt-1">SAT Core Vocabulary — Unit 4</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl w-fit">
          <Sparkles size={15} />
          {masteredCount} of {vocabWords.length} mastered
        </div>
      </div>

      <div className="h-1.5 w-full max-w-md mx-auto lg:mx-0 bg-slate-200 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(masteredCount / vocabWords.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col items-center">
        <p className="text-sm text-slate-500 mb-3">
          Card {index + 1} of {vocabWords.length}
        </p>

        {/* Flip card */}
        <div className="w-full max-w-md h-96" style={{ perspective: '1500px' }}>
          <div
            onClick={() => setFlipped((f) => !f)}
            className="relative w-full h-full cursor-pointer transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <span className="absolute top-5 left-5 text-xs font-medium text-slate-400 italic">{word.pos}</span>
              <span
                className={`absolute top-5 right-5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  masteryStyles[mastery[word.id]].badge
                }`}
              >
                {masteryStyles[mastery[word.id]].label}
              </span>
              <div className={`h-28 w-28 rounded-3xl ${word.artGradient} flex items-center justify-center mb-6`}>
                <Icon size={48} className="text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-semibold text-slate-900">{word.word}</h2>
              <p className="text-sm text-slate-400 mt-1">{word.phonetic}</p>
              <div className="absolute bottom-5 flex items-center gap-1.5 text-xs text-slate-400">
                <RotateCw size={12} /> Tap to flip
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-sm p-7 flex flex-col"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{word.word}</h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{word.definition}</p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                <p className="text-xs text-slate-500 italic leading-relaxed">{word.example}</p>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Synonyms</p>
                <div className="flex flex-wrap gap-1.5">
                  {word.synonyms.map((s) => (
                    <span key={s} className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Antonyms</p>
                <div className="flex flex-wrap gap-1.5">
                  {word.antonyms.map((a) => (
                    <span key={a} className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mastery actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => markMastery('learning')}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl transition"
          >
            <X size={15} /> Still learning
          </button>
          <button
            onClick={() => markMastery('mastered')}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl transition"
          >
            <Check size={15} /> Got it!
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={goPrev}
            aria-label="Previous word"
            className="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            {vocabWords.map((w, i) => {
              const isActive = i === index;
              const dotColor = masteryStyles[mastery[w.id]].dot;
              const dotClass = isActive ? 'w-6 bg-indigo-600' : `w-1.5 ${dotColor}`;
              return (
                <button
                  key={w.id}
                  onClick={() => goToIndex(i)}
                  aria-label={`Go to word ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${dotClass}`}
                />
              );
            })}
          </div>
          <button
            onClick={goNext}
            aria-label="Next word"
            className="h-9 w-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
