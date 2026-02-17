## 0. Estrutura global do app

### App Shell

* Topbar com título da página, busca contextual, botão “Nova transação”
* Navbar inferior no mobile, sidebar no desktop
* Tema light e dark
* Estados globais: loading, empty state, error, offline
* Atalhos rápidos: Nova entrada, Nova saída, Transferir, Ajustar crédito
* Notificações in-app e push opcionais
* Sistema de permissões (mesmo sendo pessoal): owner, viewer, no futuro

### Módulos centrais

* Auth e perfil
* Transações e categorias
* Contas e cofrinhos
* Cartões e faturas
* Orçamento e metas
* Investimentos
* Relatórios
* Importação e exportação
* Configurações e segurança

---

## 1. Onboarding

### 1.1 Boas-vindas

* Explica o que o Opus faz em 3 cards
* Escolha de tema
* Escolha de moeda e país
* Objetivo principal: organizar, economizar, investir, quitar dívidas

### 1.2 Setup inicial

* Criar contas “caixas” (ex: Principal, Reserva, Despesas Fixas)
* Adicionar cartões e limites
* Definir categorias base
* Definir metas: reserva, dívidas, aportes
* Importar dados (opcional): CSV

---

## 2. Login e Conta

### 2.1 Login

* Email e senha ou magic link
* Recuperação de senha
* Sessão persistente
* Proteção de rotas

### 2.2 Perfil

* Nome, foto, moeda, fuso horário
* Preferências de privacidade
* Backup e export rápido

---

## 3. Dashboard

### 3.1 Home

Responde em 5 segundos:

* Saldo real total
* Saldo disponível hoje
* Comprometido (fixos + faturas + parcelas)
* Cofrinhos total
* Dívidas total
* Investimentos total e variação do dia
* Próximas contas a vencer
* Últimas transações
* Atalhos: Entrada, Saída, Transferir, Aporte, Pagar fatura

### 3.2 Insights rápidos

* Gasto do mês vs média
* Categorias que mais cresceram
* Alertas: gasto acima do limite, fatura alta, reserva abaixo do mínimo

---

## 4. Transações

### 4.1 Lista de transações

* Filtros: mês, conta, categoria, tipo, recorrência, tags, método, valor, texto
* Ordenação: data, valor, categoria
* Agrupar por dia ou categoria
* Ações em lote: categorizar, mover conta, marcar como reembolsável, excluir

### 4.2 Criar transação

Campos:

* Tipo: entrada, saída, transferência, ajuste
* Valor
* Data e hora
* Conta origem e destino
* Categoria e subcategoria
* Método: pix, débito, crédito, dinheiro, boleto
* Cartão e parcelamento
* Recorrência: semanal, mensal, anual, custom
* Tags
* Nota
* Anexo: foto, PDF
* Impulso: toggle
* Reembolsável: toggle
* Centro de custo opcional

### 4.3 Detalhe da transação

* Histórico de edições
* Duplicar
* Estornar
* Anexos
* Link com fatura, meta ou orçamento

---

## 5. Contas e Caixas

### 5.1 Contas

* Lista de contas: banco, carteira, dinheiro, digital
* Saldo por conta
* Regras: saldo mínimo, conta principal
* Transferências entre contas
* Extrato por conta

### 5.2 Caixas e Cofrinhos

* Cofrinhos com meta e progresso
* Ações: depositar, resgatar, transferir entre cofrinhos
* Reserva de emergência com regra de mínimo
* Etiquetas: curto prazo, médio, longo prazo
* Visual: timeline de aportes

---

## 6. Crédito e Cartões

### 6.1 Cartões

* Lista por banco
* Limite total, usado, disponível
* Fechamento e vencimento
* Parcelamentos ativos
* Alertas de uso

### 6.2 Faturas

* Fatura atual por cartão
* Itens da fatura
* Categorias e ajustes
* Pagamentos parciais
* “Pagar fatura” e registrar pagamento
* Projeção: fatura dos próximos meses

### 6.3 Parcelamentos

* Lista de parcelas
* Valor mensal comprometido
* Botão “quitar antecipado”
* Migração de parcela entre cartões

---

## 7. Orçamentos

### 7.1 Orçamento mensal

* Limite por categoria
* “Resto do mês”
* Alertas quando bater 70%, 90%, 100%
* Regras: bloquear sugestão de gasto, ou só avisar

### 7.2 Planejamento anual

* Metas por trimestre
* Ajuste de orçamento por sazonalidade
* Comparativo ano a ano

---

## 8. Metas

### 8.1 Metas financeiras

* Reserva de emergência
* Quitar dívidas
* Comprar algo
* Aportar mensal
* Meta de gasto máximo

Campos:

* valor alvo, prazo, prioridade
* fonte de dinheiro (conta/cofre)
* progresso e previsão

### 8.2 Plano de ação

* “Hoje” e “Esta semana”
* tarefas de meta: cortar gasto, aporte, renegociar

---

## 9. Dívidas

### 9.1 Dívidas e empréstimos

* Lista: credor, saldo, juros, parcela, vencimento
* Método: bola de neve ou avalanche
* Simulador de quitação
* Pagamentos registrados como transações

### 9.2 Renegociação

* Registrar proposta
* Comparar custo total
* Timeline de decisões

---

## 10. Investimentos

### 10.1 Carteira

* Posição por ativo e classe: ações, FIIs, renda fixa, cripto, caixa
* Preço médio, quantidade, valor atual
* Rentabilidade diária e total
* Alocação percentual

### 10.2 Operações

* Compra, venda, aporte, resgate
* Taxas
* Custódia e corretora
* Eventos: dividendos, JCP, rendimentos, amortização

### 10.3 Projeções

* Aportes recorrentes
* Simulador de crescimento
* Meta de patrimônio

---

## 11. Relatórios e Analytics

### 11.1 Relatórios principais

* Receitas vs despesas
* Por categoria
* Por conta
* Por cartão
* Por período
* Tendências e sazonalidade

### 11.2 Gráficos úteis

* Pizza por categoria
* Linha de saldo ao longo do tempo
* Barras por mês
* Heatmap de gastos por dia da semana

### 11.3 Insights automáticos

* “Você gastou mais que a média”
* “Essa categoria cresceu”
* “Sua fatura está acima do normal”
* “Sua reserva caiu abaixo do mínimo”

---

## 12. Agenda financeira

### 12.1 Calendário

* Vencimentos de fatura
* Contas fixas
* Assinaturas
* Metas de aporte
* Alertas por data

### 12.2 Recorrências

* Lista de recorrências
* Pausar, editar, duplicar
* Histórico de execução

---

## 13. Importar, Exportar, Backup

### 13.1 Importar

* CSV padrão
* Mapeamento de colunas
* Preview e validação
* Regras de categoria automática

### 13.2 Exportar

* CSV por período
* PDF resumo mensal
* Backup JSON completo

### 13.3 Backup e restore

* Export rápido local
* Restore com checagem
* Versionamento de backup

---

## 14. Automação e Conectividade

### 14.1 Regras automáticas

* Categorizar por descrição
* Marcar como recorrente
* Mover para cofre automaticamente
* Alertar gasto acima do orçamento

### 14.2 Open Finance

* Conectar bancos
* Sincronizar transações
* Conciliação com manual
* Controle de permissões e revogação

---

## 15. Notificações

* Lembrete de registrar gasto
* Vencimentos próximos
* Orçamento estourando
* Aporte planejado
* Fatura fechou
* Meta em risco

Preferências por tipo e horário.

---

## 16. Configurações

### 16.1 Aparência

* Tema light/dark
* Densidade de UI
* Formato de número e moeda

### 16.2 Segurança

* Biometria no mobile
* PIN
* Sessões ativas
* Logout remoto
* 2FA opcional

### 16.3 Dados

* Categorias
* Contas
* Cartões
* Tags
* Regras automáticas

### 16.4 Sobre

* Versão
* Changelog
* Contato
* Termos e privacidade

---

## 17. Admin interno do próprio usuário

* Auditoria: histórico de mudanças
* Logs de importação
* Integridade: detectar transações duplicadas, categorias vazias, saldos inconsistentes

---

# Check de maturidade

Se você quer “versão final”, isso aqui é o mínimo de estrutura.

Agora a parte que te salva de se perder:

## Ordem certa de construção

1. Auth + RLS
2. Transações completas
3. Contas e transferências
4. Dashboard com saldos reais
5. Cartões e faturas
6. Orçamento e metas
7. Relatórios
8. Importar e exportar
9. Investimentos
10. Open Finance

Se você tentar fazer 9 e 10 antes do 2 ao 5, você vai se sabotar.
