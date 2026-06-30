'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  EyeOff,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  LayoutGrid,
} from 'lucide-react';

// Original mock items modeled on the digital SAT's split-screen Reading &
// Writing format (short passage + single question), covering the same four
// content domains the real exam uses. None of this is reproduced exam content.
const mockQuestions = [
  {
    id: 1,
    domain: 'Information and Ideas',
    passage:
      "Marine biologists have long assumed that coral reefs respond to rising ocean temperatures in a uniformly negative way. Recent fieldwork near Palau, however, suggests that some coral colonies actively adjust the algae living within their tissue, swapping in heat-tolerant strains as water temperatures climb. The finding has prompted several research teams to revisit decades-old models of coral vulnerability.",
    question: 'Which choice best states the main purpose of the text?',
    options: [
      { label: 'A', text: 'To describe a new method for measuring ocean temperature' },
      { label: 'B', text: 'To explain why coral reefs are disappearing worldwide' },
      { label: 'C', text: 'To present a finding that complicates an existing assumption about coral' },
      { label: 'D', text: 'To argue that climate change has little effect on marine ecosystems' },
    ],
  },
  {
    id: 2,
    domain: 'Craft and Structure',
    passage:
      "Before the printing press, books were copied by hand, a process that could take a single scribe several months to complete. Johannes Gutenberg's mechanical press, developed in the 1440s, could produce hundreds of identical pages in a day. ______, the spread of written knowledge across Europe accelerated dramatically.",
    question: 'Which choice completes the text with the most logical transition?',
    options: [
      { label: 'A', text: 'However' },
      { label: 'B', text: 'As a result' },
      { label: 'C', text: 'For example' },
      { label: 'D', text: 'In contrast' },
    ],
  },
  {
    id: 3,
    domain: 'Standard English Conventions',
    passage:
      "The research committee, after reviewing dozens of grant applications, ______ to extend the submission deadline by two weeks.",
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      { label: 'A', text: 'have decided' },
      { label: 'B', text: 'deciding' },
      { label: 'C', text: 'decided' },
      { label: 'D', text: 'was deciding' },
    ],
  },
  {
    id: 4,
    domain: 'Expression of Ideas',
    passage:
      "A student is researching community gardens and has taken the following notes:\n• Community gardens increase access to fresh produce in low-income neighborhoods.\n• A 2019 study found a 23% increase in vegetable consumption among participating households.\n• Gardens also create shared spaces that strengthen neighborhood social ties.\nThe student wants to emphasize the nutritional impact of community gardens.",
    question: 'Which choice most effectively uses relevant information from the notes to accomplish this goal?',
    options: [
      { label: 'A', text: 'Community gardens give neighbors a reason to spend time together outdoors.' },
      { label: 'B', text: 'A 2019 study linked participation in community gardens to a 23% rise in vegetable consumption.' },
      { label: 'C', text: 'Community gardens have become more popular in low-income neighborhoods in recent years.' },
      { label: 'D', text: 'Many cities now offer grants to help residents start community gardens.' },
    ],
  },
  {
    id: 5,
    domain: 'Craft and Structure',
    passage:
      "Srinivasa Ramanujan's notebooks, filled with intricate formulas he derived with almost no formal training, continue to ______ mathematicians a century after his death, many of whom are still uncovering new applications for his work in modern physics.",
    question: 'Which choice completes the text with the most logical and precise word?',
    options: [
      { label: 'A', text: 'confuse' },
      { label: 'B', text: 'fascinate' },
      { label: 'C', text: 'discourage' },
      { label: 'D', text: 'overwhelm' },
    ],
  },
  {
    id: 6,
    domain: 'Information and Ideas',
    passage:
      "In 2021, a research team exploring the Mariana Trench recorded a species of anglerfish producing a bioluminescent flash pattern that did not match known prey-attraction behavior. The team's working hypothesis is that the flashes instead serve as a form of communication between individuals in total darkness.",
    question: 'Which choice best states the central idea of the text?',
    options: [
      { label: 'A', text: 'Anglerfish are more common in the Mariana Trench than previously believed.' },
      { label: 'B', text: 'A newly observed light pattern in anglerfish may serve a communicative rather than predatory function.' },
      { label: 'C', text: 'Researchers have confirmed that anglerfish communicate using light.' },
      { label: 'D', text: 'Bioluminescence has only recently been discovered in deep-sea fish.' },
    ],
  },
  {
    id: 7,
    domain: 'Craft and Structure',
    passage:
      "Solar panel efficiency has climbed by nearly 30% over the past decade as manufacturers refine photovoltaic cell design. ______, the cost of installing a residential solar system has fallen by more than half over the same period.",
    question: 'Which choice completes the text with the most logical transition?',
    options: [
      { label: 'A', text: 'Nevertheless' },
      { label: 'B', text: 'Meanwhile' },
      { label: 'C', text: 'Otherwise' },
      { label: 'D', text: 'Specifically' },
    ],
  },
  {
    id: 8,
    domain: 'Standard English Conventions',
    passage:
      "Few instruments in the orchestra demand as much physical control as the oboe, ______ a reed so narrow that even small changes in air pressure noticeably affect its tone.",
    question: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
    options: [
      { label: 'A', text: 'which has' },
      { label: 'B', text: 'having' },
      { label: 'C', text: 'it has' },
      { label: 'D', text: 'has' },
    ],
  },
];

const TOTAL_SECONDS = 32 * 60; // 32-minute module, matching the real R&W module length

export default function PracticeTest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [crossedOut, setCrossedOut] = useState({});
  const [eliminatorMode, setEliminatorMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [timerVisible, setTimerVisible] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileView, setMobileView] = useState('passage');

  // Timer keeps running even when hidden, mirroring the real Bluebook "hide" toggle.
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const question = mockQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft <= 300;

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const selectAnswer = (label) => {
    const key = `${question.id}-${label}`;
    if (crossedOut[key]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: label }));
  };

  const toggleCross = (label, e) => {
    e.stopPropagation();
    const key = `${question.id}-${label}`;
    setCrossedOut((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({ ...prev, [question.id]: !prev[question.id] }));
  };

  const goTo = (idx) => {
    setCurrentIndex(idx);
    setPaletteOpen(false);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">SAT Practice — Reading and Writing</p>
            <p className="text-xs text-slate-500">Module 1 of 2</p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <button
            onClick={() => setTimerVisible((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            {timerVisible ? (
              <Clock size={15} className="text-slate-500" />
            ) : (
              <EyeOff size={15} className="text-slate-400" />
            )}
            <span
              className={`font-mono text-sm font-semibold tabular-nums ${
                isUrgent && timerVisible ? 'text-rose-600' : 'text-slate-700'
              }`}
            >
              {timerVisible ? formatTime(timeLeft) : 'Hidden'}
            </span>
          </button>
          <button className="hidden sm:inline-flex text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
            Directions
          </button>
          <button className="text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg transition">
            Save &amp; Exit
          </button>
        </div>
      </div>

      {/* Mobile passage/question tabs */}
      <div className="lg:hidden flex border-b border-slate-200">
        <button
          onClick={() => setMobileView('passage')}
          className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition ${
            mobileView === 'passage' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
          }`}
        >
          Passage
        </button>
        <button
          onClick={() => setMobileView('question')}
          className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition ${
            mobileView === 'question' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'
          }`}
        >
          Question
        </button>
      </div>

      {/* Split screen */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div
          className={`${
            mobileView === 'passage' ? 'flex' : 'hidden'
          } lg:flex flex-col w-full lg:w-1/2 lg:border-r border-slate-200 overflow-y-auto p-6 lg:p-10`}
        >
          <span className="inline-block w-fit text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-4">
            {question.domain}
          </span>
          <p className="text-slate-800 leading-relaxed whitespace-pre-line">{question.passage}</p>
        </div>

        <div
          className={`${
            mobileView === 'question' ? 'flex' : 'hidden'
          } lg:flex flex-col w-full lg:w-1/2 overflow-y-auto bg-slate-50`}
        >
          <div className="flex-1 p-6 lg:p-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 flex items-center justify-center rounded-md bg-slate-900 text-white text-xs font-bold">
                  {currentIndex + 1}
                </span>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full transition ${
                    flagged[question.id] ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Flag size={13} className={flagged[question.id] ? 'fill-amber-500 text-amber-500' : ''} />
                  Mark for Review
                </button>
              </div>
              <button
                onClick={() => setEliminatorMode((v) => !v)}
                aria-label="Toggle answer eliminator"
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                  eliminatorMode
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-300 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="line-through">ABC</span>
              </button>
            </div>

            <p className="text-slate-900 font-medium mb-6 leading-relaxed">{question.question}</p>

            <div className="space-y-3">
              {question.options.map((opt) => {
                const key = `${question.id}-${opt.label}`;
                const isCrossed = crossedOut[key];
                const isSelected = answers[question.id] === opt.label;
                return (
                  <div key={opt.label} className="flex items-center gap-2">
                    <button
                      onClick={() => selectAnswer(opt.label)}
                      disabled={isCrossed}
                      className={`flex-1 flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      } ${isCrossed ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`h-6 w-6 shrink-0 flex items-center justify-center rounded-full border-2 text-xs font-semibold ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className={`text-sm text-slate-800 ${isCrossed ? 'line-through text-slate-400' : ''}`}>
                        {opt.text}
                      </span>
                    </button>
                    {eliminatorMode && (
                      <button
                        onClick={(e) => toggleCross(opt.label, e)}
                        aria-label={isCrossed ? 'Restore option' : 'Cross out option'}
                        className="h-7 w-7 shrink-0 flex items-center justify-center rounded-full border border-slate-300 text-slate-400 hover:border-rose-400 hover:text-rose-500 transition"
                      >
                        {isCrossed ? <RotateCcw size={13} /> : <X size={13} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav + question palette */}
      <div className="relative flex items-center justify-between px-4 lg:px-6 py-3 border-t border-slate-200">
        <button
          onClick={() => goTo(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-30 hover:text-slate-900 transition"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <button
          onClick={() => setPaletteOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-medium text-slate-700 transition"
        >
          Question {currentIndex + 1} of {mockQuestions.length}
          <LayoutGrid size={14} />
        </button>

        <button
          onClick={() => goTo(Math.min(mockQuestions.length - 1, currentIndex + 1))}
          disabled={currentIndex === mockQuestions.length - 1}
          className="flex items-center gap-1 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition disabled:opacity-30"
        >
          Next <ChevronRight size={16} />
        </button>

        {paletteOpen && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-3">
              {answeredCount} of {mockQuestions.length} answered
            </p>
            <div className="grid grid-cols-4 gap-2">
              {mockQuestions.map((q, idx) => {
                const isAnswered = answers[q.id];
                const isFlagged = flagged[q.id];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(idx)}
                    className={`relative h-9 w-9 rounded-lg text-xs font-semibold flex items-center justify-center border-2 transition ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <Flag size={9} className="absolute -top-1.5 -right-1.5 fill-amber-500 text-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
