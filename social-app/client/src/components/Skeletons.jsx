export function PostSkeleton() {
  return (
    <div className="post-card skeleton-card">
      <div className="skeleton-row">
        <div className="skeleton skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-line" style={{ width: '40%' }} />
          <div className="skeleton skeleton-line" style={{ width: '25%' }} />
        </div>
      </div>
      <div className="skeleton skeleton-line" style={{ width: '90%', marginTop: 14 }} />
      <div className="skeleton skeleton-line" style={{ width: '70%' }} />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ height: 140, borderRadius: 8 }} />
      <div className="skeleton skeleton-avatar" style={{ width: 88, height: 88, marginTop: -44, marginLeft: 20, border: '4px solid var(--color-bg)' }} />
      <div className="skeleton skeleton-line" style={{ width: '30%', marginTop: 16 }} />
      <div className="skeleton skeleton-line" style={{ width: '50%' }} />
    </div>
  );
}
