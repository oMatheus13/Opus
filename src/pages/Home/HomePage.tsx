const HomePage = () => {
  return (
    <section className="home">
      <div className="home__card">
        <p className="home__label">Saldo da carteira</p>
        <h1 className="home__balance">R$ 0,00</h1>

        <div className="home__flows">
          <div className="home__flow home__flow--in">
            <i className="fi fi-sr-arrow-up" aria-hidden="true" />
            <strong>+R$ 0,00</strong>
          </div>
          <div className="home__flow home__flow--out">
            <i className="fi fi-sr-arrow-down" aria-hidden="true" />
            <strong>-R$ 0,00</strong>
          </div>
        </div>

        <div className="home__actions home__actions--metaball">
          <div className="home__actions-goo" aria-hidden="true">
            <span className="home__action home__action--ghost">
              <i className="fi fi-sr-arrow-up-right" aria-hidden="true" />
              Entrada
            </span>
            <span className="home__action home__action--ghost">
              <i className="fi fi-sr-arrow-down-left" aria-hidden="true" />
              Retirada
            </span>
            <span className="home__action home__action--icon home__action--ghost">
              <i className="fi fi-sr-apps" aria-hidden="true" />
            </span>
          </div>
          <button className="home__action" type="button">
            <i className="fi fi-sr-arrow-up-right" aria-hidden="true" />
            Entrada
          </button>
          <button className="home__action" type="button">
            <i className="fi fi-sr-arrow-down-left" aria-hidden="true" />
            Retirada
          </button>
          <button
            className="home__action home__action--icon"
            type="button"
            aria-label="Mais opcoes"
          >
            <i className="fi fi-sr-apps" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
