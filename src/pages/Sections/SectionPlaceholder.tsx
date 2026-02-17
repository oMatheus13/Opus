type SectionPlaceholderProps = {
  icon: string;
  text: string;
};

const SectionPlaceholder = ({ icon, text }: SectionPlaceholderProps) => {
  return (
    <section className="section-placeholder app-glass">
      <i className={`fi fi-sr-${icon}`} aria-hidden="true" />
      <p>{text}</p>
    </section>
  );
};

export default SectionPlaceholder;
