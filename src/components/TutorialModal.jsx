import React, { useState } from 'react';
import { Icons } from './Icons';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to WebBuilder!',
    subtitle: 'Build stunning websites without writing code',
    content: (
      <>
        <p>WebBuilder is a powerful drag-and-drop website builder that lets you create professional websites in minutes.</p>
        <p>This quick tutorial will show you how to use all the features to build your perfect website.</p>
      </>
    ),
    image: null
  },
  {
    id: 'components',
    title: 'Add Components',
    subtitle: 'Drag and drop to build your page',
    content: (
      <>
        <p>The <strong>left sidebar</strong> contains all the components you can add to your page:</p>
        <ul className="tutorial-list">
          <li><strong>Basic:</strong> Text, buttons, images, links, and dividers</li>
          <li><strong>Layout:</strong> Containers, grids, and sections for structure</li>
          <li><strong>Media:</strong> Images, videos, and icons</li>
          <li><strong>Forms:</strong> Input fields, buttons, and complete forms</li>
        </ul>
        <p className="tutorial-tip">Tip: Simply drag any component onto the canvas to add it to your page.</p>
      </>
    ),
    image: null
  },
  {
    id: 'editing',
    title: 'Edit & Style',
    subtitle: 'Click to select, then customize',
    content: (
      <>
        <p>Click any element on the canvas to select it. The <strong>right sidebar</strong> shows all editing options:</p>
        <ul className="tutorial-list">
          <li><strong>Style Tab:</strong> Change colors, fonts, spacing, borders, and more</li>
          <li><strong>Layers Tab:</strong> See and manage all page elements in a tree view</li>
          <li><strong>Design Tab:</strong> Get AI-powered suggestions to improve your design</li>
        </ul>
        <p className="tutorial-tip">Tip: Use the number fields to precisely control sizes and spacing.</p>
      </>
    ),
    image: null
  },
  {
    id: 'ai-design',
    title: 'AI Design Assistant',
    subtitle: 'Get intelligent design suggestions',
    content: (
      <>
        <p>The <strong>Design tab</strong> uses AI to analyze your website and suggest improvements:</p>
        <ul className="tutorial-list">
          <li><strong>Color Contrast:</strong> Ensures text is readable</li>
          <li><strong>Visual Hierarchy:</strong> Makes important elements stand out</li>
          <li><strong>Spacing:</strong> Improves layout consistency</li>
          <li><strong>Accessibility:</strong> Helps make your site usable for everyone</li>
        </ul>
        <p className="tutorial-tip">Tip: Click "Analyze Design" to get personalized suggestions for your page.</p>
      </>
    ),
    image: null
  },
  {
    id: 'preview-save',
    title: 'Preview & Save',
    subtitle: 'See your work and save progress',
    content: (
      <>
        <p>Use the <strong>top toolbar</strong> to preview and manage your work:</p>
        <ul className="tutorial-list">
          <li><strong>Device Toggle:</strong> Switch between desktop and mobile views</li>
          <li><strong>Undo/Redo:</strong> Easily correct mistakes</li>
          <li><strong>Clear Canvas:</strong> Start fresh with a blank canvas</li>
          <li><strong>Export:</strong> Download your finished website as HTML</li>
        </ul>
        <p className="tutorial-tip">Tip: Your work is automatically saved as you make changes!</p>
      </>
    ),
    image: null
  },
  {
    id: 'templates',
    title: 'Start with Templates',
    subtitle: 'Jump-start your project',
    content: (
      <>
        <p>Don't want to start from scratch? <strong>Browse our template library</strong> for ready-made designs:</p>
        <ul className="tutorial-list">
          <li><strong>Landing Pages:</strong> Perfect for marketing and product launches</li>
          <li><strong>Portfolios:</strong> Showcase your work professionally</li>
          <li><strong>Business:</strong> Corporate and small business sites</li>
          <li><strong>E-commerce:</strong> Online store layouts</li>
        </ul>
        <p className="tutorial-tip">Tip: Click "Browse Templates" in the dashboard to explore all options.</p>
      </>
    ),
    image: null
  },
  {
    id: 'ready',
    title: "You're Ready!",
    subtitle: 'Start building your website',
    content: (
      <>
        <p>You now know the basics of WebBuilder. Here's how to get started:</p>
        <ol className="tutorial-list tutorial-numbered">
          <li>Create a new project or choose a template</li>
          <li>Drag components onto your canvas</li>
          <li>Click elements to customize their style</li>
          <li>Use the Design tab for AI suggestions</li>
          <li>Preview and export when you're done</li>
        </ol>
        <p className="tutorial-tip">You can access this tutorial anytime from the dashboard's "Learn" section.</p>
      </>
    ),
    image: null
  }
];

function TutorialModal({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <button className="tutorial-close" onClick={handleSkip} title="Skip tutorial">
          <Icons.X />
        </button>

        <div className="tutorial-progress">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>

        <div className="tutorial-content">
          <div className="tutorial-step-number">Step {currentStep + 1} of {TUTORIAL_STEPS.length}</div>
          <h2 className="tutorial-title">{step.title}</h2>
          <p className="tutorial-subtitle">{step.subtitle}</p>
          <div className="tutorial-body">
            {step.content}
          </div>
        </div>

        <div className="tutorial-footer">
          <button className="tutorial-btn-skip" onClick={handleSkip}>
            Skip Tutorial
          </button>
          <div className="tutorial-nav">
            {!isFirstStep && (
              <button className="tutorial-btn-prev" onClick={handlePrev}>
                <Icons.ChevronLeft />
                Back
              </button>
            )}
            <button className="tutorial-btn-next" onClick={handleNext}>
              {isLastStep ? "Let's Go!" : 'Next'}
              {!isLastStep && <Icons.ChevronRight />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;
