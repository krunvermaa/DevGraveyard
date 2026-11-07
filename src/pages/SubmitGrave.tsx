import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CauseOfDeath, GraveFormData, Grave } from '../types';
import { submitGrave } from '../services/graveService';
import { isValidGithubRepoUrl, calculateGraveScore, getGraveTier, calculateGraveScoreBreakdown } from '../services/graveScoreService';
import { generateAiPostMortem } from '../services/aiPostMortemService';
import { trackGraveBuried } from '../services/analyticsService';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { GraveCard } from '../components/GraveCard';
import { useAuth } from '../contexts/AuthContext';
import { GithubRepoPicker } from "../components/GithubRepoPicker";
import { Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Shield, Code2, Award, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type SubmissionState = 'idle' | 'burying' | 'soul-rising' | 'complete';
type StepNumber = 1 | 2 | 3;

const QUICK_CAUSE_CHIPS = [
  'Scope Creep',
  'Framework Fatigue',
  'Burnout',
  'Abandoned Prototypes',
  'Solitary Maintenance',
  'Lack of Time',
  'Market Fit Missing',
  'Technical Roadblocks'
];

export const SubmitGrave: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const [formData, setFormData] = useState<GraveFormData>({
    project_name: '',
    cause_of_death: 'Scope Creep',
    lived_for: '',
    lesson_learned: '',
    tech_stack: '',
    github_link: '',
    is_anonymous: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GraveFormData, string>>>({});

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof GraveFormData, string>> = {};
    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required for the tombstone inscription.";
    }
    if (formData.github_link && formData.github_link.trim() !== '') {
      if (!isValidGithubRepoUrl(formData.github_link.trim())) {
        newErrors.github_link = "Please provide a valid GitHub repo URL (e.g. https://github.com/user/repo).";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof GraveFormData, string>> = {};
    if (!formData.cause_of_death.trim()) {
      newErrors.cause_of_death = "Please specify a cause of death for the autopsy.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = () => {
    const newErrors: Partial<Record<keyof GraveFormData, string>> = {};
    if (!formData.project_name.trim()) newErrors.project_name = "Required for inscription.";
    if (!formData.lesson_learned.trim()) newErrors.lesson_learned = "Please share your hard-won wisdom.";
    if (formData.lesson_learned.trim().length < 10) newErrors.lesson_learned = "Elaborate slightly more (at least 10 characters).";
    
    if (formData.github_link && formData.github_link.trim() !== '') {
      if (!isValidGithubRepoUrl(formData.github_link.trim())) {
        newErrors.github_link = "Only valid GitHub repository links are permitted.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber);
    }
  };

  const handleAiPostMortemAssist = async () => {
    setIsGeneratingAi(true);
    try {
      const generated = await generateAiPostMortem({
        projectName: formData.project_name,
        causeOfDeath: formData.cause_of_death,
        livedFor: formData.lived_for,
        techStack: formData.tech_stack,
        githubLink: formData.github_link,
      });

      if (generated) {
        setFormData(prev => ({ ...prev, lesson_learned: generated }));
        if (errors.lesson_learned) {
          setErrors(prev => ({ ...prev, lesson_learned: undefined }));
        }
      }
    } catch (err) {
      console.error('AI post-mortem generation error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      if (!formData.project_name.trim()) setCurrentStep(1);
      else if (!formData.lesson_learned.trim() || formData.lesson_learned.trim().length < 10) setCurrentStep(3);
      return;
    }

    // Start Burial Animation Sequence
    setSubmissionState('burying');
    
    try {
      await submitGrave(
        formData, 
        user?.uid, 
        userProfile?.username || undefined,
        userProfile?.photoURL || user?.photoURL || undefined
      );

      // Anonymous analytics tracking
      trackGraveBuried(formData.cause_of_death, {
        tech_stack: formData.tech_stack,
        is_anonymous: formData.is_anonymous,
      });
      
      // Step 2: Transition to soul rising after grave descends (2.5s)
      setTimeout(() => {
        setSubmissionState('soul-rising');
        
        // Step 3: Transition to completion after soul rises (3.5s)
        setTimeout(() => {
          setSubmissionState('complete');
          
          // Step 4: Navigate away after reading completion message (2.5s)
          setTimeout(() => {
            navigate('/cemetery');
          }, 2500);
        }, 3500);
      }, 2500);

    } catch (error: any) {
      console.error('Failed to bury project', error);
      const msg = error?.message || "Failed to bury project. Please check connectivity or try again.";
      if (msg.includes("GitHub")) {
        setErrors(prev => ({ ...prev, github_link: msg }));
        setCurrentStep(1);
      } else {
        setErrors(prev => ({ ...prev, project_name: msg }));
      }
      setSubmissionState('idle');
    }
  };

  const causeOptions = [
    ...QUICK_CAUSE_CHIPS.map(c => ({ value: c, label: c })),
    ...Object.values(CauseOfDeath)
      .filter(c => !QUICK_CAUSE_CHIPS.includes(c))
      .map(c => ({ value: c, label: c }))
  ];

  // Preview Grave for calculation and animation
  const previewGrave: Grave = {
    ...formData,
    id: 'preview',
    created_at: new Date().toISOString(),
    user_name: userProfile?.username || 'You',
    user_avatar: userProfile?.photoURL || user?.photoURL || undefined
  };

  const currentScore = calculateGraveScore(previewGrave);
  const currentTier = getGraveTier(currentScore);
  const scoreBreakdown = calculateGraveScoreBreakdown(previewGrave);

  if (submissionState !== 'idle') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center relative px-4">
        {/* Burying State: Card Descends */}
        {submissionState === 'burying' && (
          <div className="relative animate-grave-descend z-10 w-full max-w-md">
            <GraveCard grave={previewGrave} className="shadow-2xl opacity-90 scale-95" />
          </div>
        )}

        {/* Soul Rising State: Glowing Orb */}
        {submissionState === 'soul-rising' && (
          <div className="absolute z-20 flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-[#c53030] shadow-[0_0_50px_15px_rgba(223,54,54,0.7)] animate-soul-rise" />
            <span className="mt-4 font-mono text-xs uppercase tracking-widest text-[#f87171] animate-pulse">
              Transcending the physical server...
            </span>
          </div>
        )}

        {/* Complete State: Text Fade In */}
        {submissionState === 'complete' && (
          <div className="text-center space-y-4 animate-fade-in max-w-md">
            <div className="text-4xl select-none" role="img" aria-label="resting headstone">🪦</div>
            <h2 className="text-2xl sm:text-3xl font-serif text-zinc-200 tracking-wide">
              {formData.project_name || 'Project'} laid to rest.
            </h2>
            <p className="text-[#c53030] font-mono text-xs sm:text-sm uppercase tracking-widest">
              May its code find peace in the eternal void.
            </p>
            <p className="text-zinc-500 font-mono text-xs">
              Redirecting to the sacred grounds...
            </p>
          </div>
        )}

        {/* Ground Line Visualization */}
        {submissionState === 'burying' && (
          <div className="absolute bottom-10 w-full h-px bg-zinc-800/80 shadow-[0_0_20px_rgba(0,0,0,1)] z-30" />
        )}
        
        <div className="absolute bottom-2 text-center w-full">
           {submissionState === 'burying' && (
             <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">
               Commencing final rites...
             </p>
           )}
        </div>
      </div>
    );
  }

  // Interactive Guided Burial Ceremony Form
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 opacity-0 animate-fade-in-up px-3 sm:px-6">
      {/* Ceremony Header */}
      <div className="mb-6 sm:mb-8 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-widest">
          <span className="text-red-500">†</span> Final Burial Rites <span className="text-red-500">†</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 font-serif tracking-tight">
          Bury a Departed Project
        </h1>
        <p className="text-zinc-400 font-serif italic text-sm sm:text-base max-w-lg mx-auto">
          "Every abandoned repository was once a dream. Commemorate the build, archive the wisdom, and free your mind."
        </p>
      </div>

      {/* Step Flow Navigation Tracker */}
      <div className="mb-6 bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* Step 1 Tab */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold shadow-md'
                : currentStep > 1
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span className="truncate">Identity</span>
          </button>

          {/* Step 2 Tab */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold shadow-md'
                : currentStep > 2
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span className="truncate">Autopsy</span>
          </button>

          {/* Step 3 Tab */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setCurrentStep(3);
            }}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-[#c53030]/20 border border-[#c53030] text-white font-bold shadow-md'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
              3
            </span>
            <span className="truncate">Epitaph</span>
          </button>
        </div>
      </div>

      {/* Main Burial Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-950/70 p-5 sm:p-8 rounded-2xl border border-zinc-800/80 shadow-2xl backdrop-blur-sm relative">
        
        {/* STEP 1: PROJECT IDENTITY */}
        {currentStep === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
          >
            <div className="border-b border-zinc-800/80 pb-3 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-semibold">
                Step 1 of 3
              </span>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                Project Identity & Repository
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Name your creation and connect its GitHub archive if available.
              </p>
            </div>

            <Input 
              id="project_name"
              label="NAME OF THE DEPARTED *"
              placeholder="e.g. HyperGraph, CryptoSnack, TodoFlow, NeuroMesh"
              value={formData.project_name}
              onChange={e => {
                setFormData({ ...formData, project_name: e.target.value });
                if (errors.project_name) setErrors(prev => ({ ...prev, project_name: undefined }));
              }}
              error={errors.project_name}
              autoFocus
            />

            <div className="space-y-2">
              <Input 
                id="github_link"
                label="GITHUB REPOSITORY (OPTIONAL, +75 GRAVESCORE BONUS)"
                placeholder="https://github.com/username/repository"
                value={formData.github_link}
                onChange={e => {
                  setFormData({ ...formData, github_link: e.target.value });
                  if (errors.github_link) setErrors(prev => ({ ...prev, github_link: undefined }));
                }}
                error={errors.github_link}
                type="url"
              />
              <GithubRepoPicker 
                selectedUrl={formData.github_link}
                onSelectRepo={(url, name, language) => {
                  setFormData(prev => ({
                    ...prev,
                    github_link: url,
                    project_name: prev.project_name || name,
                    tech_stack: prev.tech_stack || (language || '')
                  }));
                  if (errors.github_link) {
                    setErrors(prev => ({ ...prev, github_link: undefined }));
                  }
                  if (errors.project_name) {
                    setErrors(prev => ({ ...prev, project_name: undefined }));
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="is_anonymous"
                checked={formData.is_anonymous}
                onChange={e => setFormData({ ...formData, is_anonymous: e.target.checked })}
                className="appearance-none h-4 w-4 border border-zinc-700 bg-zinc-900 checked:bg-[#c53030]/20 checked:border-[#c53030] focus:ring-0 focus:outline-none transition-all duration-300 cursor-pointer rounded"
              />
              <label htmlFor="is_anonymous" className="text-xs font-mono text-zinc-300 uppercase tracking-wide cursor-pointer hover:text-[#c53030] transition-colors">
                Bury in an unmarked grave (Anonymous / hide author)
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="button"
                onClick={handleNextStep}
                className="min-h-[44px] px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Proceed to Autopsy</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: AUTOPSY */}
        {currentStep === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
          >
            <div className="border-b border-zinc-800/80 pb-3 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-semibold">
                Step 2 of 3
              </span>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                The Autopsy & Demise
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Diagnose what halted development, how long it fought, and what stack powered it.
              </p>
            </div>

            {/* Quick-Select Cause of Death Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-mono tracking-widest uppercase text-zinc-400">
                QUICK-SELECT PRIMARY CAUSE OF DEATH
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_CAUSE_CHIPS.map((chip) => {
                  const isSelected = formData.cause_of_death === chip;
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cause_of_death: chip }))}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#c53030]/20 border-[#c53030] text-red-300 font-bold shadow-[0_0_12px_rgba(197,48,48,0.3)]'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select 
                id="cause_of_death"
                label="CAUSE OF DEATH (CUSTOM / FULL LIST)"
                options={causeOptions}
                value={formData.cause_of_death}
                onChange={e => setFormData({ ...formData, cause_of_death: e.target.value as string })}
              />
              <Input 
                id="lived_for"
                label="LIFESPAN DURATION"
                placeholder="e.g. 3 months, 2 weekends, 1 hackathon"
                value={formData.lived_for}
                onChange={e => setFormData({ ...formData, lived_for: e.target.value })}
              />
            </div>

            <Input 
              id="tech_stack"
              label="TECHNOLOGY STACK (COMMA-SEPARATED)"
              placeholder="e.g. React, Next.js, Rust, Firebase, PostgreSQL, Tailwind"
              value={formData.tech_stack}
              onChange={e => setFormData({ ...formData, tech_stack: e.target.value })}
            />

            <div className="pt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                onClick={handlePrevStep}
                variant="outline"
                className="min-h-[44px] px-5 py-2.5 border-zinc-800 bg-zinc-900 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Identity</span>
              </Button>

              <Button
                type="button"
                onClick={handleNextStep}
                className="min-h-[44px] px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Proceed to Epitaph</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: EPITAPH & FINAL RITES */}
        {currentStep === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="border-b border-zinc-800/80 pb-3 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-semibold">
                Step 3 of 3
              </span>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                Epitaph & Final Tombstone Preview
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Inscribe your hard-won lesson learned. Use AI assistance if you need inspiration.
              </p>
            </div>

            {/* Lesson Learned Field with AI Post-Mortem Assist */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="lesson_learned" className="block text-xs font-mono tracking-widest uppercase text-zinc-300">
                  THE LESSON LEARNED & EPITAPH *
                </label>
                <button
                  type="button"
                  onClick={handleAiPostMortemAssist}
                  disabled={isGeneratingAi}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#c53030]/60 bg-[#c53030]/15 hover:bg-[#c53030]/30 text-red-200 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="Generate a personalized post-mortem based on your cause of death and stack"
                >
                  {isGeneratingAi ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span>{isGeneratingAi ? 'Analyzing Demise...' : '✨ AI Post-Mortem Assist'}</span>
                </button>
              </div>

              <Textarea 
                id="lesson_learned"
                placeholder="What actually went wrong? What would you do differently on your next build? (Or click ✨ AI Post-Mortem Assist above to auto-draft)"
                value={formData.lesson_learned}
                onChange={e => {
                  setFormData({ ...formData, lesson_learned: e.target.value });
                  if (errors.lesson_learned) setErrors(prev => ({ ...prev, lesson_learned: undefined }));
                }}
                error={errors.lesson_learned}
                rows={4}
              />
            </div>

            {/* Interactive Tombstone Tier Preview */}
            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label="Tombstone tier icon">{currentTier.icon}</span>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Tombstone Tier</span>
                    <h3 className={`text-base font-serif font-bold ${currentTier.textColor}`}>
                      {currentTier.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Estimated Score</span>
                  <div className="text-lg font-mono font-bold text-red-400">
                    {currentScore} pts
                  </div>
                </div>
              </div>

              <p className="text-xs font-mono text-zinc-400 italic">
                {currentTier.description}
              </p>

              {/* Score Breakdown Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex flex-col">
                  <span className="text-zinc-500 uppercase text-[9px]">Wisdom</span>
                  <span className="text-zinc-200 font-bold">+{scoreBreakdown.lessonsWisdom} pts</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex flex-col">
                  <span className="text-zinc-500 uppercase text-[9px]">Open Source</span>
                  <span className={formData.github_link ? "text-emerald-400 font-bold" : "text-zinc-500 font-bold"}>
                    +{scoreBreakdown.openSourceSanctity} pts
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex flex-col">
                  <span className="text-zinc-500 uppercase text-[9px]">Tech Stack</span>
                  <span className="text-zinc-200 font-bold">+{scoreBreakdown.techComplexity} pts</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex flex-col">
                  <span className="text-zinc-500 uppercase text-[9px]">Lifespan</span>
                  <span className="text-zinc-200 font-bold">+{scoreBreakdown.lifespanEndurance} pts</span>
                </div>
              </div>
            </div>

            {/* Interactive Live Mini Tombstone Card Preview */}
            <div className="space-y-2">
              <span className="block text-[11px] font-mono uppercase tracking-widest text-zinc-400 text-center">
                Interactive Tombstone Inscription Preview
              </span>
              <div className="transform scale-[0.98] transition-transform">
                <GraveCard grave={previewGrave} className="shadow-2xl border-[#c53030]/30" />
              </div>
            </div>

            {/* Navigation and Final Lay to Rest Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button
                type="button"
                onClick={handlePrevStep}
                variant="outline"
                className="min-h-[44px] px-5 py-2.5 border-zinc-800 bg-zinc-900 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Autopsy</span>
              </Button>

              <Button 
                type="submit" 
                variant="danger"
                className="min-h-[44px] px-8 py-3 text-xs uppercase tracking-widest font-mono font-bold bg-[#c53030] hover:bg-[#b02727] text-white border border-red-500 hover:border-red-400 shadow-[0_0_25px_rgba(197,48,48,0.5)] hover:shadow-[0_0_35px_rgba(197,48,48,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2"
                isLoading={submissionState !== 'idle'}
              >
                <span>Lay It to Rest (Bury Project)</span>
              </Button>
            </div>
          </motion.div>
        )}
      </form>
      
      <div className="text-center mt-6">
        <button 
          type="button" 
          onClick={() => navigate('/cemetery')} 
          className="min-h-[44px] px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-zinc-500 cursor-pointer"
        >
          [ Cancel and Return to Graveyard ]
        </button>
      </div>
    </div>
  );
};
