import React from 'react';
import { TEMPLATES } from '../data/templates';

function OnboardingModal({ onSelect }) {
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <div className="onboarding-logo">WB</div>
          <h1 className="onboarding-title">Welcome to WebBuilder</h1>
          <p className="onboarding-subtitle">
            Pick a template to get started quickly, or build from scratch.
          </p>
        </div>

        <div className="template-grid">
          {TEMPLATES.map(template => (
            <button
              key={template.id}
              className="template-card"
              onClick={() => onSelect(template)}
            >
              <div className="template-icon">{template.icon}</div>
              <div className="template-name">{template.label}</div>
              <div className="template-desc">{template.description}</div>
              <div className="template-cta">Use this template</div>
            </button>
          ))}
        </div>

        <div className="onboarding-footer">
          <button className="blank-canvas-btn" onClick={() => onSelect(null)}>
            ✏️ Start with a blank canvas
          </button>
          <p className="onboarding-hint">You can change everything at any time</p>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
