export default function EmptyState({ icon = '📭', title = 'Nothing here', description = '', action = null }) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && action}
    </div>
  );
}
