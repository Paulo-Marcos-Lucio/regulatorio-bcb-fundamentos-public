# PARTE IV — Open Finance Brasil

> **Open Finance** é o sistema regulado pelo BCB que permite **compartilhamento padronizado de dados financeiros** entre instituições, com **consentimento explícito do cliente**. É o tema mais complexo deste material — vale ler com calma.

---

## Capítulo 18 — O que é Open Finance e por que existe

### O problema

Antes do Open Finance, sua relação com seu banco era **um silo**. Os dados das suas contas, cartões, financiamentos, investimentos viviam dentro do banco e **só ele** podia usá-los pra te oferecer produtos.

Se você queria mudar de banco, abrir conta em fintech, contratar empréstimo melhor, ou usar app agregador de finanças — você precisava **inserir tudo manualmente**, ou no máximo dar sua **senha** pro app fazer "screen scraping" (ilegal e inseguro).

### A solução

O BCB criou o **Open Finance Brasil** baseado em um princípio: **os dados financeiros são do cliente, não do banco**. Logo, o cliente deve poder:

1. **Autorizar** uma instituição (Receptora) a acessar seus dados em outra (Detentora)
2. **Iniciar pagamentos** a partir de aplicativos de terceiros
3. **Cancelar a qualquer momento**
4. **Ter portabilidade real** entre instituições

### Diferença entre Open Banking e Open Finance

- **Open Banking** = só dados de **conta bancária e cartão** (escopo inicial)
- **Open Finance** = dados bancários **+ investimentos + seguros + previdência + câmbio**

O Brasil **começou como Open Banking em 2021** e evoluiu pra **Open Finance** ao longo de 2022–2024.

> **🔑 Pra call:** quando alguém usa "Open Banking" e "Open Finance" como sinônimos no Brasil, **estão se referindo ao mesmo programa do BCB hoje**. O termo evoluiu, o programa se chama oficialmente "Open Finance Brasil".

### Por que importa pra você

Open Finance é **a maior oportunidade de consultoria regulatória do mercado brasileiro em 2026**. Toda fintech, banco, seguradora e gestora precisa estar tecnicamente conformante. **Consultoria nessa área = R$ 50–200k por engajamento médio**, com tickets de 12+ meses não sendo raros.

---

## Capítulo 19 — As 4 fases do Open Finance

O programa foi rolling-out em 4 fases. Cada uma adicionou um conjunto de dados/operações disponíveis:

### Fase 1 — Dados das próprias instituições (canais e produtos)

> **Lançada 2021.**

Cada banco/IF expõe **publicamente** dados sobre:
- Canais de atendimento (agências, ATMs, telefones)
- Produtos e serviços (taxas de cartão, juros de empréstimo)

Esses dados são **abertos** (sem consentimento), pra qualquer um consultar. Útil pra comparadores de produtos.

### Fase 2 — Dados cadastrais e transacionais (consent-based)

> **Lançada 2021.**

Dados **do cliente**, com consentimento dele:
- Cadastrais (nome, endereço, telefone, e-mail)
- Conta corrente (saldo, extrato)
- Cartão de crédito (limite, fatura, transações)
- Operações de crédito (empréstimos, financiamentos)

Aqui entra o conceito de **consentimento granular** — cliente escolhe **quais dados** compartilha, **com quem**, e **por quanto tempo**.

### Fase 3 — Iniciação de pagamentos (PISP)

> **Lançada 2022.**

App de terceiros pode **iniciar uma transação Pix** em nome do cliente, sem o cliente precisar abrir o app do banco. Exemplo: e-commerce que tem botão "Pagar com Open Finance" — você autoriza dentro do próprio site, sem sair pra app de banco.

> **🔑 PISP — Payment Initiation Service Provider** (Iniciador de Pagamento). É um **novo tipo de instituição** criada pelo Open Finance, regulada pelo BCB, que pode iniciar pagamentos sem ser dona da conta.

### Fase 4 — Investimentos, seguros, previdência, câmbio

> **Lançada 2023–2024.**

Compartilhamento estendido:
- Saldo e posições em investimentos (corretoras, fundos)
- Apólices de seguros, previdência aberta
- Operações de câmbio

> **💡 Importante:** o nome "Fase 4" hoje significa basicamente o **escopo expandido de dados**. Os repos `pix-automatico-reference` e o futuro `open-finance-payments-reference` mexem principalmente com **Fase 3 (iniciação)**, já que pagamento é Fase 3.

### Resumo das fases

| Fase | Foco | Consentimento? |
|---|---|---|
| 1 | Dados públicos das IFs (canais, produtos) | Não |
| 2 | Dados do cliente (cadastro, conta, cartão, crédito) | Sim, granular |
| 3 | Iniciação de pagamentos por terceiros | Sim, por transação |
| 4 | Investimentos, seguros, previdência, câmbio | Sim |

---

## Capítulo 20 — Atores e papéis

```
                  ┌──────────────────────────────────┐
                  │     DIRETÓRIO CENTRAL OFB        │
                  │  (registry de participantes)     │
                  │  https://data.directory.openfinancebrasil.org.br
                  └─────▲─────────────────────────▲──┘
                        │ registro                │
                        │                         │
        ┌───────────────┴────────┐    ┌──────────┴─────────────┐
        │   DETENTORA            │    │    RECEPTORA           │
        │   (banco do cliente)   │◄───┤  (fintech, agregador)  │
        │   ex: Itaú             │    │    ex: GuiaBolso       │
        │                        │    │                        │
        │   expõe APIs           │    │   consome APIs         │
        │   /consents            │    │   solicita consent     │
        │   /accounts            │    │   acessa dados         │
        │   /payments            │    │                        │
        └───────────▲────────────┘    └────────▲───────────────┘
                    │                          │
                    │  consentimento           │  jornada UX
                    │  + autenticação          │
                    │                          │
                    └──────────┬───────────────┘
                               │
                          ┌────▼─────┐
                          │ CLIENTE  │
                          │ (titular │
                          │ dos dados)│
                          └──────────┘
```

### Detalhe dos papéis

#### Detentora (Account Servicing Payment Service Provider — ASPSP)

- A instituição que **detém** os dados/conta do cliente
- Geralmente é o banco principal do cliente
- **Expõe** as APIs Open Finance: `/consents`, `/accounts`, `/payments`, etc.
- **Autentica** o cliente (login, biometria, MFA) durante a jornada de consentimento
- Responsável por **validar consent** em cada chamada

#### Receptora / Iniciadora (Receiver — Third Party Provider — TPP)

- Instituição que **quer acessar** dados ou iniciar pagamentos em nome do cliente
- Pode ser **qualquer instituição autorizada** pelo BCB (banco, fintech, agregador, e-commerce)
- **Consome** as APIs da Detentora
- Subdivide em:
  - **Account Information Service Provider (AISP)** — só lê dados (Fase 2 e 4)
  - **Payment Initiation Service Provider (PISP)** — inicia pagamentos (Fase 3)

#### Diretório Central (OFB Directory)

- Registry **único e oficial** de participantes do Open Finance Brasil
- Mantido pela **estrutura de governança do Open Finance** (consórcio público-privado supervisionado pelo BCB)
- Toda instituição autorizada está lá com:
  - Cert TLS de produção
  - Endpoints (Discovery URL, FAPI URL)
  - Software statements (SSA)
  - Status de conformidade
- **Você precisa consultar o Diretório** pra saber qual a URL do FAPI do banco com o qual quer integrar

> **🔑 Pra call:** "**Diretório Central**" e "**SSA — Software Statement Assertion**" são termos altamente específicos de Open Finance. Mencioná-los corretamente já te coloca acima da maioria.

---

## Capítulo 21 — FAPI 2.0 + Brasil profile

> O Open Finance Brasil **não inventou um padrão técnico do zero**. Adotou o **FAPI** (Financial-grade API), um perfil OAuth 2.0 + OpenID Connect criado pela OpenID Foundation pra finanças. E aplicou customizações = **"Brasil profile"**.

### O que é FAPI

**FAPI = Financial-grade API**. É um perfil de OAuth 2.0/OIDC com **segurança reforçada** pra cenários financeiros:
- Autenticação mútua TLS (**mTLS**) ou DPoP
- **Request Object** assinado (JWS)
- **Response Mode** assinado
- **PAR — Pushed Authorization Requests**
- **JARM — JWT Secured Authorization Response Mode**

Foi originalmente criado pra Open Banking UK. Brasil adotou o **FAPI 2.0** (versão evoluída, mais segura).

### Por que FAPI

OAuth 2.0 puro tem fragilidades documentadas (token leak via redirect, code injection, replay). FAPI fecha essas brechas exigindo:
- **PKCE obrigatório** (proteção contra interceptação)
- **mTLS sender-constrained tokens** (token só funciona com o cert que o pegou)
- **Request signing** (cliente assina a requisição, servidor valida assinatura)
- **JARM** (resposta também assinada — proteção contra MITM)

### Brasil profile — o que tem além do FAPI base

O Brasil profile adiciona/customiza:
- **DCR — Dynamic Client Registration** com **SSA do Diretório Central**
- **Consent flow específico** (mais granular que o padrão)
- **Operações brasileiras** (Pix, dados de cartão, etc.) — não tem no FAPI vanilla
- **Validação de cert ICP-Brasil** em pontos específicos

### Em resumo, pra um dev

Quando você ouvir "FAPI 2.0 + Brasil profile":
- É um conjunto de regras técnicas em cima de OAuth 2.0
- **Padronizadas pelo Open Finance Brasil** (governança privada com supervisão BCB)
- Especificações estão no **Developer Portal**: `openfinancebrasil.org.br`
- Existem **suites de conformance** que você roda pra provar que sua implementação está correta

> **🔑 Pra call:** "Implementamos o **FAPI 2.0 perfil Brasil** com PAR + JARM + mTLS sender-constrained". Essa frase é instant credibility com qualquer time técnico de fintech séria.

---

## Capítulo 22 — Consentimento (Consents): a peça central

O Open Finance gira em torno de **consentimento explícito do cliente**. Vamos detalhar.

### Anatomia de um consentimento

Um consent contém:

| Campo | Significado |
|---|---|
| `consentId` | UUID único |
| `loggedUser` | CPF do cliente |
| `permissions` | Lista granular: `ACCOUNTS_READ`, `CREDIT_CARDS_READ`, `PAYMENTS_INITIATE`, etc. |
| `expirationDateTime` | Quando o consent expira (até 12 meses pra dados) |
| `transactionFromDateTime` | Janela de dados acessíveis (mais antigo) |
| `transactionToDateTime` | Janela de dados acessíveis (mais novo) |
| `creditor` | Pra Fase 3 — recebedor do pagamento |
| `payment` | Pra Fase 3 — valor, descrição |

### Jornada de UX (simplificada)

```
[Cliente está no app/site da Receptora]
   ▼
[Receptora chama POST /consents na Detentora]
   ▼
[Receptora redireciona cliente pra Detentora]
   ▼
[Cliente faz login na Detentora (banco dele)]
   ▼
[Cliente vê tela: "Esta empresa pede acesso a X, Y, Z. Confirma?"]
   ▼
[Cliente confirma com biometria/PIN]
   ▼
[Detentora redireciona cliente de volta pra Receptora]
   ▼
[Receptora agora tem authorization code]
   ▼
[Receptora troca code por access_token via FAPI]
   ▼
[Receptora pode chamar /accounts, /payments, etc., usando o token]
```

### Estados de um consent

```
AWAITING_AUTHORIZATION (criado, aguardando cliente autorizar)
    ▼
AUTHORISED (cliente autorizou)
    ▼
CONSUMED (consent atendeu propósito — comum em Fase 3, pagamento single-use)
    OU
REJECTED (cliente recusou)
    OU
EXPIRED (passou da expirationDateTime)
    OU
REVOKED (cliente cancelou ativamente)
```

### Granularidade

Cliente pode autorizar APENAS **algumas permissões** de uma lista. Exemplo: cliente pode autorizar leitura de **conta corrente** mas não de **cartão de crédito**. Isso obriga a UX da Receptora a explicar **qual exatamente é o escopo** que pede.

### Cancelamento

Cliente pode cancelar o consent **a qualquer momento** pelo app da Detentora (e pela Receptora também). Isso revoga os tokens.

> **⚠️ Implicação técnica importante:** sua Receptora precisa **tratar 401 Unauthorized vindo de uma API que ANTES funcionava** — o consent pode ter sido revogado entre uma chamada e outra. Não é exceção rara, é fluxo esperado.

---

## Capítulo 23 — Iniciação de pagamentos (Fase 3) em detalhe

Esta é a parte que mais te interessa pro `open-finance-payments-reference`.

### O caso de uso clássico

**E-commerce com botão "Pagar com Open Finance"**:

1. Cliente está no checkout do e-commerce
2. Clica "Pagar com Open Finance"
3. Seleciona seu banco (Itaú)
4. É redirecionado pro Itaú, faz login, vê tela:
   *"Loja XYZ pede pagamento de R$ 150 da sua conta corrente. Confirma?"*
5. Confirma com biometria
6. Itaú **inicia o Pix** (na verdade um Pix pelo SPI, mas iniciado por terceiro)
7. Cliente é redirecionado de volta pro e-commerce
8. E-commerce recebe webhook confirmando pagamento

### Por que isso é melhor que QR estático tradicional

- **Não precisa abrir app do banco e copiar/colar Pix copia-e-cola**
- **UX no próprio site** (com 1 redirect rápido)
- **Reconciliação automática** (e-commerce sabe imediatamente do pagamento)
- **Padrão regulatório** (não dependente de bandeira de cartão)

### Atores adicionais da Fase 3

- **Iniciadora (PISP)** — quem inicia o pagamento. Pode ser:
  - O próprio e-commerce, se autorizado pelo BCB
  - Um intermediário (gateway de pagamento certificado)
- **Detentora (banco do cliente)** — executa o Pix
- **Recebedor** — pode ser o e-commerce ou um terceiro

### Anatomia da operação `/payments`

```http
POST /payments/v1/pix/payments HTTP/1.1
Host: matls-api.banco.com.br
Authorization: Bearer <access_token mTLS sender-constrained>
Content-Type: application/jwt

<JWS assinado>
   ↓ decodificado:
{
  "data": {
    "consentId": "urn:bancoex:C1DD33123",
    "creditorAccount": {
      "ispb": "12345678",
      "issuer": "0001",
      "number": "1234567",
      "accountType": "CACC"
    },
    "localInstrument": "DICT",
    "payment": {
      "amount": "150.00",
      "currency": "BRL"
    },
    "remittanceInformation": "Pedido #98765"
  }
}
```

A Detentora valida:
- Consent ainda autorizado?
- Conta debitada bate com o consent?
- Saldo OK?
- Transação dentro dos limites do consent?

Se tudo OK, dispara o Pix via SPI normalmente.

### Pix Automático via Open Finance

> **Atenção: aqui se conecta com a Parte II.**

O **Pix Automático** lançado em out/2025 **se beneficia diretamente do Open Finance Fase 3**: a iniciadora (ex: gateway de cobrança recorrente) usa Open Finance pra obter consentimento de **N pagamentos futuros**, e dispara cada um sem nova autorização do cliente.

Esta é a razão do seu `pix-automatico-reference` mencionar "Open Finance Fase 4" no posicionamento — porque o caso de uso real combina os dois.

### Riscos e SLA

- **SLA da Detentora:** o BCB exige disponibilidade alta (verificar percentual atual no manual — tipicamente acima de 99,5%) das APIs Open Finance
- **Multas por descumprimento de SLA** podem ser aplicadas
- **Conformance test** obrigatório antes de ir pra produção (homologação)

---

## Resumo da Parte IV — pontos pra call

| Pergunta provável | Resposta pronta |
|---|---|
| "Open Finance vs Open Banking?" | "Brasil começou como Open Banking em 2021 e expandiu pra Open Finance em 2023+ — hoje cobre dados bancários, cartão, crédito, investimentos, seguros e iniciação de pagamentos" |
| "Quais as fases?" | "Fase 1: dados públicos. Fase 2: dados do cliente. Fase 3: iniciação de pagamentos (PISP). Fase 4: investimentos, seguros, previdência" |
| "O que é FAPI 2.0 + Brasil profile?" | "Perfil OAuth 2.0/OIDC reforçado pra finanças, com mTLS sender-constrained, request signing, PAR e JARM. Brasil customiza com SSA do Diretório, validação ICP-Brasil e ops específicas" |
| "Como funciona consent?" | "É autorização granular do cliente, com permissões específicas e prazo. Cliente autoriza no banco (Detentora) durante redirect, pode revogar a qualquer hora" |
| "Diferença Fase 3 vs Pix tradicional?" | "Fase 3 permite que terceiro (e-commerce, gateway) **inicie** o Pix em nome do cliente, com consent. O Pix em si roda pelo SPI normal. UX fica dentro do app do terceiro" |
| "O que é Diretório Central?" | "Registry oficial de participantes do Open Finance Brasil, supervisionado pelo BCB. Toda instituição autorizada está lá com SSA, certs, endpoints" |

> **📍 Onde estamos:** Open Finance dominado. Você sabe os atores, os fluxos, FAPI, consent, e como Pix Automático se encaixa. **Próxima parte: Open Insurance + Compliance.**

