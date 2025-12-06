import React from 'react';

export function CarCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text-short"></div>
        <div className="skeleton-line skeleton-price"></div>
      </div>
    </div>
  );
}

export function BrandCardSkeleton() {
  return (
    <div className="skeleton-brand-card">
      <div className="skeleton-logo"></div>
      <div className="skeleton-line skeleton-brand-name"></div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="skeleton-form">
      <div className="skeleton-line skeleton-form-title"></div>
      <div className="skeleton-line skeleton-form-field"></div>
      <div className="skeleton-line skeleton-form-field"></div>
      <div className="skeleton-line skeleton-form-field"></div>
      <div className="skeleton-line skeleton-form-button"></div>
    </div>
  );
}

