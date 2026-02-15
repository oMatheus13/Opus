import { useAuth } from "../../hooks/useAuth";

type ProfilePageProps = {
  displayName: string;
  email: string;
  onClose?: () => void;
};

const ProfilePage = ({ displayName, email, onClose }: ProfilePageProps) => {
  const { signOut } = useAuth();

  return (
    <section className="profile">
      <header className="profile__header">
        <div>
          <p className="profile__eyebrow">Perfil</p>
          <h1 className="profile__title">Sua conta</h1>
          <p className="profile__subtitle">Gerencie suas informacoes</p>
        </div>
        {onClose ? (
          <button className="button button--ghost profile__back" type="button" onClick={onClose}>
            <i className="fi fi-sr-angle-left" aria-hidden="true" />
            Voltar
          </button>
        ) : null}
      </header>

      <div className="profile__card app-glass">
        <div className="profile__row">
          <span>Nome</span>
          <strong>{displayName}</strong>
        </div>
        <div className="profile__row">
          <span>Email</span>
          <strong>{email || "Sem email"}</strong>
        </div>
        <button className="button button--danger profile__logout" type="button" onClick={signOut}>
          Sair
        </button>
      </div>
    </section>
  );
};

export default ProfilePage;
