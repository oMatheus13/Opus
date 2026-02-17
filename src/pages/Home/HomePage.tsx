import { useState } from "react";

const HomePage = () => {
  const [showMoreActions, setShowMoreActions] = useState(false);

  return (
    <section className="home">
      <div className="home__hero">
        <div className="home__card">
          <p className="home__label">Saldo da carteira</p>
          <h1 className="home__balance sensitive">R$ 0,00</h1>

          <div className="home__flows">
            <div className="home__flow home__flow--in">
              <i className="fi fi-sr-arrow-up" aria-hidden="true" />
              <strong className="sensitive">+R$ 0,00</strong>
            </div>
            <div className="home__flow home__flow--out">
              <i className="fi fi-sr-arrow-down" aria-hidden="true" />
              <strong className="sensitive">-R$ 0,00</strong>
            </div>
          </div>

          <div className="home__actions home__actions--primary home__actions--metaball">
            <div className="home__actions-goo" aria-hidden="true">
              <span className="home__action home__action--ghost">
                <i className="fi fi-sr-arrow-up-right" aria-hidden="true" />
                Entrada
              </span>
              <span className="home__action home__action--ghost">
                <i className="fi fi-sr-arrow-down-left" aria-hidden="true" />
                Saída
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
              Saída
            </button>
            <button
              className="home__action home__action--icon"
              type="button"
              aria-label="Mais opções"
              aria-expanded={showMoreActions}
              aria-controls="home-more-actions"
              onClick={() => setShowMoreActions((prev) => !prev)}
            >
              <i className="fi fi-sr-apps" aria-hidden="true" />
            </button>
          </div>

          {showMoreActions ? (
            <div className="home__actions home__actions--secondary" id="home-more-actions">
              <button className="home__action" type="button">
                <i className="fi fi-sr-exchange" aria-hidden="true" />
                Transferir
              </button>
              <button className="home__action" type="button">
                <i className="fi fi-sr-chart-line-up" aria-hidden="true" />
                Aporte
              </button>
              <button className="home__action" type="button">
                <i className="fi fi-sr-credit-card" aria-hidden="true" />
                Pagar fatura
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <section className="home__summary">
        <article className="home__summary-card app-glass">
          <span className="home__summary-label">Saldo real total</span>
          <strong className="home__summary-value sensitive">R$ 0,00</strong>
          <span className="home__summary-meta">Hoje</span>
        </article>
        <article className="home__summary-card app-glass">
          <span className="home__summary-label">Saldo disponível hoje</span>
          <strong className="home__summary-value sensitive">R$ 0,00</strong>
          <span className="home__summary-meta">Após compromissos</span>
        </article>
        <article className="home__summary-card app-glass">
          <span className="home__summary-label">Comprometido</span>
          <strong className="home__summary-value home__summary-value--warn sensitive">
            R$ 0,00
          </strong>
          <span className="home__summary-meta">Fixos + faturas</span>
        </article>
        <article className="home__summary-card app-glass">
          <span className="home__summary-label">Cofrinhos</span>
          <strong className="home__summary-value sensitive">R$ 0,00</strong>
          <span className="home__summary-meta">Total reservado</span>
        </article>
        <article className="home__summary-card app-glass">
          <span className="home__summary-label">Dívidas</span>
          <strong className="home__summary-value home__summary-value--danger sensitive">
            R$ 0,00
          </strong>
          <span className="home__summary-meta">Em aberto</span>
        </article>
        <article className="home__summary-card app-glass">
          <span className="home__summary-label">Investimentos</span>
          <strong className="home__summary-value sensitive">R$ 0,00</strong>
          <span className="home__summary-meta home__summary-meta--positive sensitive">
            <i className="fi fi-sr-arrow-up-right" aria-hidden="true" /> 0,0% hoje
          </span>
        </article>
      </section>

      <section className="home__grid">
        <div className="home__panel app-glass">
          <div className="home__panel-header">
            <h2 className="home__section-title">Próximas contas a vencer</h2>
            <button className="button button--link button--sm" type="button">
              Ver agenda
            </button>
          </div>
          <ul className="home__list">
            <li className="home__list-item">
              <div>
                <strong>Internet residencial</strong>
                <span>Vence em 3 dias</span>
              </div>
              <span className="home__list-value sensitive">R$ 0,00</span>
            </li>
            <li className="home__list-item">
              <div>
                <strong>Energia elétrica</strong>
                <span>Vence em 5 dias</span>
              </div>
              <span className="home__list-value sensitive">R$ 0,00</span>
            </li>
            <li className="home__list-item">
              <div>
                <strong>Cartão principal</strong>
                <span>Vence em 8 dias</span>
              </div>
              <span className="home__list-value sensitive">R$ 0,00</span>
            </li>
          </ul>
        </div>

        <div className="home__panel app-glass">
          <div className="home__panel-header">
            <h2 className="home__section-title">Últimas transações</h2>
            <button className="button button--link button--sm" type="button">
              Ver tudo
            </button>
          </div>
          <ul className="home__list">
            <li className="home__list-item">
              <div>
                <strong>Mercado</strong>
                <span>Hoje • Alimentação</span>
              </div>
              <span className="home__list-value home__list-value--out sensitive">
                -R$ 0,00
              </span>
            </li>
            <li className="home__list-item">
              <div>
                <strong>Salário</strong>
                <span>Ontem • Entrada</span>
              </div>
              <span className="home__list-value home__list-value--in sensitive">
                +R$ 0,00
              </span>
            </li>
            <li className="home__list-item">
              <div>
                <strong>Assinatura</strong>
                <span>Ontem • Serviços</span>
              </div>
              <span className="home__list-value home__list-value--out sensitive">
                -R$ 0,00
              </span>
            </li>
            <li className="home__list-item">
              <div>
                <strong>Transferência</strong>
                <span>2 dias • Entre contas</span>
              </div>
              <span className="home__list-value sensitive">R$ 0,00</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="home__insights">
        <div className="home__panel-header">
          <h2 className="home__section-title">Insights rápidos</h2>
        </div>
        <div className="home__insight-grid">
          <article className="home__insight-card app-glass">
            <span className="home__insight-label">Gasto do mês vs média</span>
            <strong className="home__insight-value sensitive">R$ 0,00</strong>
            <span className="home__insight-meta sensitive">0% vs média</span>
          </article>
          <article className="home__insight-card app-glass">
            <span className="home__insight-label">Categorias que mais cresceram</span>
            <strong className="home__insight-value">Sem dados</strong>
            <span className="home__insight-meta">Acompanhe o mês</span>
          </article>
          <article className="home__insight-card app-glass">
            <span className="home__insight-label">Alertas ativos</span>
            <strong className="home__insight-value">Nenhum alerta</strong>
            <span className="home__insight-meta">Tudo sob controle</span>
          </article>
        </div>
      </section>
    </section>
  );
};

export default HomePage;
