# PARTE I — Fundamentos do Sistema Financeiro Brasileiro

> Esta parte assume **conhecimento zero** de finanças. Começamos do princípio: o que é um banco, como o dinheiro circula entre eles, e quem fica olhando pra ninguém roubar nem quebrar tudo.

---

## Capítulo 1 — O que é um banco, no fundo

Esquece por um minuto a fachada de mármore e os caixas eletrônicos. Um banco, em essência, é **uma empresa que faz três coisas**:

1. **Guarda dinheiro de gente** (depósitos)
2. **Empresta dinheiro pra outra gente** (crédito)
3. **Move dinheiro de A pra B** (pagamentos)

A mágica é que o banco usa o dinheiro guardado de quem deposita pra emprestar pra outros — e cobra juros mais altos no empréstimo do que paga no depósito. Essa diferença (o **spread bancário**) é a fonte primária de receita.

### Por que isso importa pra um engenheiro?

Porque cada produto digital de banco — Pix, TED, débito, cartão, conta corrente — é **uma forma de executar uma dessas três operações**. Quando você implementa um cliente DICT ou um iniciador Pix, você está construindo um pedaço da operação **3 (mover dinheiro)**.

> **💡 Sacada importante:** o saldo da sua conta não é dinheiro físico guardado num cofre com seu nome. É só **uma linha num banco de dados** dizendo "o banco deve X reais a este CPF". Toda a infraestrutura de pagamentos é, no fundo, um sistema distribuído de **atualização sincronizada de números em bancos de dados de instituições diferentes**.

### Tipos básicos de instituição financeira

Não tem só "banco" no Brasil. A regulação separa em vários tipos:

| Tipo | Sigla | O que faz | Exemplo |
|---|---|---|---|
| Banco múltiplo | — | Pode fazer todas as operações (depósito, crédito, câmbio, etc.) | Itaú, Bradesco, Santander |
| Banco comercial | — | Foco em depósitos à vista e crédito de curto prazo | (cada vez mais raro isolado) |
| Caixa Econômica | — | Banco público com mandato social (FGTS, loterias, habitacional) | Caixa |
| Cooperativa de crédito | — | Banco "associativo", clientes são donos | Sicoob, Sicredi |
| Instituição de Pagamento | **IP** | NÃO pode emprestar, só movimentar dinheiro | Mercado Pago, PicPay (na origem) |
| Sociedade de Crédito Direto | **SCD** | Empresta dinheiro PRÓPRIO (sem captar de terceiros) | várias fintechs de crédito |
| Sociedade de Empréstimo entre Pessoas | **SEP** | Plataforma P2P de crédito | Nexoos, Biva |
| Banco Digital | — | É só um banco múltiplo sem agência física | Nubank, Inter, C6 |

> **🔑 Termo que você VAI ouvir em call:** **PSP — Prestador de Serviços de Pagamento**. É o termo guarda-chuva pro que você seria se sua empresa estiver no Pix. Inclui banco, IP, cooperativa — qualquer um autorizado pelo BCB a operar Pix.

### Por que tantos tipos?

A diferença está em **o que cada uma pode fazer com o dinheiro do cliente** e **quanto capital próprio é exigido pra operar**. Banco múltiplo pode emprestar — então precisa de muito capital de reserva pra absorver calote. IP só movimenta — capital exigido é menor.

Pra você como dev, o que muda é **qual regulação aplica**. Um banco enfrenta regras mais pesadas que uma IP. Mas TODAS que mexem com Pix seguem as **mesmas regras Pix do BCB**, independente do tipo.

---

## Capítulo 2 — Como o dinheiro circula entre bancos

Quando você manda R$ 100 pro seu primo no Inter e você é cliente do Itaú, o que acontece?

### A versão simplificada

1. Você dá ordem ao Itaú: "tira R$ 100 da minha conta e manda pro CPF X no Inter"
2. Itaú **debita** R$ 100 da sua conta (linha no DB do Itaú)
3. Itaú avisa o Inter: "mandei R$ 100 pro CPF X de vocês"
4. Inter **credita** R$ 100 na conta do seu primo (linha no DB do Inter)
5. Mas o Inter agora tá "devendo" R$ 100 pro Itaú? Como zera essa dívida?

A resposta é o **Sistema de Pagamentos Brasileiro (SPB)**.

### O Sistema de Pagamentos Brasileiro (SPB)

O SPB é a **infraestrutura nacional** que liquida (zera) as dívidas entre instituições. Ele existe pra resolver o problema 5 acima: como instituições diferentes acertam contas entre si sem ter que entregar saco de dinheiro toda hora.

Os componentes principais:

| Sistema | O que faz | Quem opera | Janela |
|---|---|---|---|
| **STR** — Sistema de Transferência de Reservas | Liquidação **bruta em tempo real** entre bancos | BCB | 24/7 |
| **SILOC** | Liquidação **diferida** (em lotes) de TED, boletos, cheques | BCB | Diário |
| **SPI** — Sistema de Pagamentos Instantâneos | Liquidação **instantânea** do Pix | BCB | 24/7/365 |
| **CIP** | Câmara interbancária privada (TEDs, boletos) | CIP S.A. | Diário |

> **💡 Bruta vs Líquida:** Liquidação **bruta** = cada operação é zerada uma a uma, na hora. **Líquida** = junta todas as operações do dia, calcula o saldo final, e zera 1 vez. STR é bruta (real-time). SILOC é líquida (acumula e fecha no fim do dia).

### Onde o Pix se encaixa

O Pix usa o **SPI**. Quando você manda Pix:

1. Seu PSP (digamos, Itaú) **debita** seu saldo
2. Itaú envia mensagem padrão Pix pelo **SPI**
3. SPI verifica se tem grana na **conta de reserva** do Itaú no BCB
4. SPI **transfere** dos reservas do Itaú pros reservas do Inter (movimentação dentro do BCB)
5. SPI avisa Inter
6. Inter **credita** seu primo

Toda transação Pix passa pelo SPI. **O BCB é o operador do SPI** — ou seja, o BCB sabe de TODAS as transações Pix do país. Isso tem implicações de privacidade, segurança e regulação que vamos ver depois.

### "Conta de reserva" — o que é isso?

Toda instituição financeira autorizada a participar do SPB precisa manter **uma conta no Banco Central** com saldo em reais. É essa conta que é movimentada quando o SPI liquida um Pix.

Pense assim: o BCB é "o banco dos bancos". Se Itaú e Inter fossem clientes do mesmo banco (BCB), uma transferência entre eles seria só um lançamento contábil interno. É exatamente isso que acontece via SPI.

> **🔑 Termo pra call:** "**conta reservas**" ou "**conta no BCB**". Quando alguém disser "o banco precisa ter saldo em reservas pra liquidar a operação", agora você entende.

---

## Capítulo 3 — Quem regula quem: BCB, CMN, Susep, CVM

O Brasil tem **4 órgãos** que regulam o sistema financeiro, cada um cuidando de um pedaço:

### 1. CMN — Conselho Monetário Nacional

- **O que é:** o "alto comando" da política monetária e financeira do país
- **Composição:** Ministro da Fazenda + Ministro do Planejamento + Presidente do BCB
- **O que faz:** define **diretrizes gerais** — política monetária, taxa de juros básica, política cambial
- **Não regula no detalhe:** delega isso pro BCB e CVM
- **Em call:** raramente alguém menciona o CMN. É político, não operacional.

### 2. BCB — Banco Central do Brasil

- **O que é:** autarquia federal autônoma. **O órgão que VOCÊ vai conviver.**
- **O que faz:**
  - Executa a política monetária (define Selic na prática via Copom)
  - Emite a moeda
  - **Regula e fiscaliza bancos, IPs, cooperativas, fintechs de pagamento**
  - **Opera o SPB e o SPI (Pix)**
  - **Mantém o DICT**
  - **Coordena o Open Finance**
- **Em call:** sempre. Quando alguém diz "o regulador", está falando do BCB.

> **🔑 Estrutura do BCB que VOCÊ vai esbarrar:**
> - **Departamento de Operações Bancárias e de Sistema de Pagamentos (Deban)** — cuida do Pix, DICT, SPB
> - **Departamento de Regulação do Sistema Financeiro (Denor)** — escreve as Resoluções e Circulares
> - **Departamento de Supervisão de Conduta (Decon)** — fiscaliza condutas (multas vêm daqui)

### 3. CVM — Comissão de Valores Mobiliários

- **O que é:** regulador do **mercado de capitais** (ações, fundos, debêntures)
- **O que faz:** fiscaliza Bolsa, corretoras, fundos de investimento
- **Em call de Pix/Open Finance/DICT:** raramente menciona. Mais relevante se o seu cliente for corretora ou gestora.

### 4. Susep — Superintendência de Seguros Privados

- **O que é:** regulador do **mercado de seguros**, capitalização e previdência aberta
- **O que faz:**
  - Fiscaliza seguradoras
  - **Coordena o Open Insurance (OPIN)**
- **Em call:** sempre que falar de Open Insurance / OPIN é Susep.

### Resumo simples

| Setor | Regulador |
|---|---|
| Bancos, fintechs, Pix, Open Finance | **BCB** |
| Seguros, OPIN | **Susep** |
| Bolsa, fundos, corretoras | **CVM** |
| Diretrizes macro do país | **CMN** |

---

## Capítulo 4 — A pirâmide regulatória: Lei → Resolução → Circular → Manual

Quando você lê "conforme a Resolução BCB nº XXX" e fica perdido, é por causa dessa hierarquia. Saber isso te coloca em outro patamar em call:

```
┌─────────────────────────────────────────────────────────┐
│  LEI                                                     │
│  (passa pelo Congresso, demora anos)                    │
│  Ex: Lei 4.595/64 — criou o SFN; Lei 12.865/13 — IPs    │
└──────────────────┬──────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────┐
│  RESOLUÇÃO CMN                                          │
│  (CMN decide a diretriz alto nível)                     │
│  Ex: define que pagamentos instantâneos vão existir      │
└──────────────────┬──────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────┐
│  RESOLUÇÃO BCB                                          │
│  (BCB regulamenta, com força quase de lei)              │
│  Ex: Resolução BCB 1/2020 — criou o Pix                 │
└──────────────────┬──────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────┐
│  CIRCULAR / INSTRUÇÃO NORMATIVA BCB                     │
│  (detalhamento operacional)                              │
│  Ex: detalhes técnicos de SLA, mensageria               │
└──────────────────┬──────────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────────┐
│  MANUAL OPERACIONAL                                     │
│  (especificação técnica — JSON schemas, XML, fluxos)    │
│  Ex: Manual de Operação do DICT, Manual do SPI          │
│  Aqui você como engenheiro vive 90% do tempo            │
└─────────────────────────────────────────────────────────┘
```

> **💡 O que isso significa pra você na prática:**
> - **Resoluções** mudam raramente, são "constitucionais" do tema
> - **Manuais** mudam frequentemente (versões a cada poucos meses)
> - **Cliente sério vai te perguntar "qual versão do Manual do DICT vocês implementam?"** — saber responder é sinal de senioridade
> - Quando alguém disser "aderência regulatória", está falando de cumprir TODA a pirâmide acima, não só o manual

### Onde achar essa documentação (oficial e gratuita)

- **Resoluções e Circulares BCB:** site do BCB, seção "Normas e padrões" → busca por número
- **Manuais técnicos do Pix/DICT/SPI:** site do BCB, seção "Pix" → "Especificações técnicas"
- **Open Finance Brasil:** `openfinancebrasil.org.br` (regras + Developer Portal com OpenAPI specs)
- **Open Insurance:** `opensusep.susep.gov.br`

> **⚠️ Atenção:** os números, datas e versões específicas mudam. Sempre verifique a versão vigente antes de citar em call. "Conforme a versão atual do Manual do DICT" é mais seguro que "conforme o Manual versão 2.5" — porque pode já ter saído a 2.6.

---

## Glossário rápido da Parte I

| Termo | Significado (versão crua) |
|---|---|
| **SFN** | Sistema Financeiro Nacional — todas as instituições reguladas |
| **SPB** | Sistema de Pagamentos Brasileiro — infra nacional de pagamentos |
| **SPI** | Sistema de Pagamentos Instantâneos — onde o Pix roda |
| **STR** | Sistema de Transferência de Reservas — liquidação real-time entre bancos |
| **PSP** | Prestador de Serviços de Pagamento — qualquer um que opera Pix |
| **IF** | Instituição Financeira (genérico) |
| **IP** | Instituição de Pagamento — fintech que só movimenta, não empresta |
| **BCB** | Banco Central do Brasil |
| **CMN** | Conselho Monetário Nacional |
| **Susep** | Reguladora de seguros |
| **CVM** | Reguladora de mercado de capitais |
| **Conta reservas** | Conta de cada IF no BCB usada pra liquidar entre instituições |
| **Spread bancário** | Diferença entre juros que banco cobra emprestando e paga captando |
| **Liquidação bruta** | Cada operação liquidada individualmente em tempo real |
| **Liquidação líquida** | Operações agregadas e liquidadas em saldo no fim do dia |

---

> **📍 Onde estamos:** acabamos de cobrir o "mapa" do sistema financeiro. Você sabe quem é quem, quem regula o quê, e por onde o dinheiro passa entre instituições. As próximas partes mergulham em **cada produto regulatório individualmente** — começando pelo Pix.

