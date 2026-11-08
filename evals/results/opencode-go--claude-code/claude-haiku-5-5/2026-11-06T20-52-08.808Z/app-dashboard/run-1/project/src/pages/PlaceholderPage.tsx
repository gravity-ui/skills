export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{title}</h1>
        <p className="page__subtitle">{description}</p>
      </header>
    </div>
  );
}
