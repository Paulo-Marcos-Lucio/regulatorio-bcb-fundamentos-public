# PARTE V — Open Insurance + Compliance e Operação

---

## Capítulo 24 — Open Insurance Brasil (OPIN)

> O **OPIN** é o equivalente do Open Finance, mas para o **mercado segurador** brasileiro. Regulado pela **Susep** (não pelo BCB), com escopo, atores e fases próprios.

### O que é

Sistema regulado pela Susep que permite **compartilhamento padronizado de dados de seguros, previdência aberta e capitalização**, com consentimento do cliente. Mesma filosofia do Open Finance: dados são do cliente, não da seguradora.

### Por que existe

- **Portabilidade:** dificuldade pra trocar de seguradora porque cliente não consegue mover histórico
- **Comparação:** apólices entre seguradoras eram opacas
- **Inovação:** insurtechs queriam construir produtos de comparação e gestão, mas dependiam de screen scraping ou parcerias bilaterais

### Diferenças vs Open Finance

| Característica | Open Finance (BCB) | Open Insurance (Susep) |
|---|---|---|
| Regulador | BCB | Susep |
| Diretório | OFB Directory | OPIN Directory |
| Foco | Banco, conta, crédito, pagamentos | Seguros, previdência, capitalização |
| Padrão técnico | FAPI 2.0 + Brasil profile | FAPI 2.0 + Brasil profile (similar, mas com customizações de seguros) |
| Iniciação de pagamentos | Sim (Fase 3) | Sim (também tem fluxo de pagamento de prêmio) |

### Atores no OPIN

- **Sociedade Detentora** — seguradora ou EAPC (Entidade Aberta de Previdência Complementar) que detém os dados
- **Sociedade Receptora** — recebe os dados (pode ser seguradora, corretora, insurtech)
- **Sociedade Iniciadora de Serviços de Pagamento** — análoga ao PISP do Open Finance, mas pra produtos de seguro
- **Cliente** — segurado, beneficiário, ou participante de previdência

### Fases do OPIN

(Verificar versão atual do roadmap Susep — fases evoluíram desde lançamento.)

Em linhas gerais:
1. **Dados públicos** — produtos, canais, condições de seguros
2. **Dados cadastrais e de apólices** — apólices ativas, sinistros, beneficiários
3. **Iniciação de operações** — solicitação de cotação, contratação, pagamento de prêmio
4. **Produtos especializados** — saúde, previdência, capitalização

### FAPI-CIBA — uma especificidade do OPIN

OPIN usa **CIBA — Client-Initiated Backchannel Authentication**. É um modo de OAuth onde:
- A autorização **não acontece via redirect no browser**
- A Detentora dispara uma **notificação fora-de-banda** pro cliente (push no app, SMS)
- Cliente aprova **diretamente no app da seguradora**, sem voltar pra origem
- Receptora recebe callback quando aprovado

**Por que CIBA importa pra seguros:** muitos cenários de seguro acontecem em **call center** ou **corretor presencial**. O cliente **não está no celular dele** quando o atendente solicita o consent. Com CIBA, o atendente dispara solicitação, o celular do cliente vibra com push, ele aprova lá.

> **🔑 Pra call:** "OPIN usa **FAPI-CIBA** porque a jornada de venda de seguro frequentemente é assistida (call center, corretor). CIBA permite consent fora do canal de origem."

### Por que isso é uma oportunidade pra você

OPIN tem **menos consultoria especializada que Open Finance**. Mercado é menor mas com **menos competição**. Seu repo `open-insurance-transmissor-reference` planejado pode ser referência canônica em PT-BR — quase ninguém publicou material sério.

---

## Capítulo 25 — Compliance regulatório: o que é, na prática

> "Compliance" é um daqueles termos que todo mundo usa e ninguém define direito. Vamos definir.

### Compliance, na regulação financeira BR, é cumprir 4 camadas

1. **Regulação prudencial** — ter capital e estrutura mínima
2. **Regulação de conduta** — operar dentro das regras (KYC, AML, transparência)
3. **Regulação técnica** — APIs, mensageria, padrões (Pix, OF, DICT)
4. **Regulação informacional** — relatórios periódicos pro BCB/Susep

Pra **TI/engenharia**, as camadas 3 e 4 são onde você vive. Camadas 1 e 2 são de Compliance Officer.

### O que sua implementação técnica precisa garantir

| Aspecto | Exemplo concreto |
|---|---|
| **Conformidade ao manual técnico** | Schemas JSON/XML batem com a versão vigente |
| **Logs auditáveis** | Cada operação grava log com timestamp, request ID, resultado |
| **Rastreabilidade end-to-end** | Trace ID que cruza Pix → Open Finance → DICT |
| **Segurança de comunicação** | mTLS válido, certs ICP-Brasil, sem fallback inseguro |
| **Resiliência** | Retentativas controladas, circuit breakers, idempotência |
| **Privacidade** | Mascaramento de dados sensíveis em logs e responses |
| **Disponibilidade** | Uptime acima do SLA regulatório |

> **🔑 Pra call:** "**Conformidade técnica** ≠ **conformidade regulatória completa**. A engenharia entrega conformidade técnica; o jurídico/Compliance Officer entrega o resto. Mas se a engenharia errar, a multa cai na empresa toda."

### Auditoria: o que perguntam em call de compliance

Quando uma fintech contrata você pra adequação, é provável que perguntem:

1. **"Como vocês logam transações Pix?"** — formato JSON estruturado, retenção mínima de X anos
2. **"Como vocês mascaram dados sensíveis?"** — CPF parcial, número de conta parcial em logs
3. **"Vocês têm dashboards de SLA das APIs?"** — Grafana/Datadog mostrando p95/p99/disponibilidade
4. **"Qual a estratégia de retentativa?"** — backoff exponencial, max attempts, idempotência
5. **"Como vocês detectam fraude?"** — heurísticas, scoring, integração com fraud markers do DICT
6. **"Vocês têm runbook pra incidentes regulatórios?"** — quando contatar BCB, prazos de notificação

Se você tem boa resposta pra essas 6 perguntas, **você passa a entrevista técnica de qualquer fintech séria**.

---

## Capítulo 26 — Tipos de risco regulatório

Quando alguém fala "risco" no mundo regulatório, pode estar falando de várias coisas:

### Risco Operacional

Falha em processos, pessoas, sistemas. Ex: SPI ficar 30min indisponível pra um PSP, transações ficam empilhadas.

**Mitigação técnica:** circuit breakers, fallback gracioso, monitoring de SLA, capacity planning.

### Risco de Liquidez

Ficar sem saldo na conta de reservas no BCB pra liquidar Pix. Pix com saldo insuficiente nas reservas fica **bloqueado pelo SPI**.

**Mitigação:** capital reservado, monitoring proativo de uso de reservas, credit lines com BCB.

### Risco de Crédito

Em operações onde uma instituição "deve" outra (ex: entre janelas de liquidação líquida no SILOC). Risco de uma quebrar e a outra ficar com prejuízo.

**Mitigação:** Pix mitiga isso porque liquida bruta em tempo real (sem janela de exposição entre instituições).

### Risco de Fraude

Cliente A finge ser cliente B, golpes via engenharia social, contas laranja recebendo Pix de golpes.

**Mitigação técnica:** integração com `fraud-markers` do DICT, ML anti-fraude, validação de comportamento (limites por horário, padrão de gasto), MED.

### Risco Cibernético

Ataque externo a APIs, vazamento de dados, ransomware.

**Mitigação:** mTLS, WAF, DDoS protection, hardening de servidores, pentests regulares.

### Risco de Conduta

Empresa praticar venda casada, omitir taxas, dar informação falsa. Aqui é mais conduta humana que sistema.

**Mitigação:** treinamento, KYC robusto, monitoring de canais de atendimento.

### Risco Sistêmico

Risco de uma falha em uma instituição grande contaminar o sistema todo. **O Pix tem essa preocupação porque é centralizado no BCB.**

**Mitigação (do BCB):** redundância do SPI, contingências, regras de SLA pesadas.

> **🔑 Pra call:** quando cliente pergunta sobre risco, identifique **qual** risco. "Risco" sozinho não diz nada. **"Risco operacional do nosso cliente Pix"** ou **"risco cibernético do nosso endpoint DICT"** são frases concretas.

---

## Capítulo 27 — Multas, sanções e enforcement

> **⚠️ Advertência:** valores específicos de multa **mudam** com nova regulação. Os números abaixo são qualitativos pra você ter ideia de magnitude. **Em call, NÃO cite valor específico** sem ter checado o número atualizado nas Resoluções vigentes.

### Quem aplica multa

- **BCB (Decon)** — para descumprimento de regras de Pix, Open Finance, DICT, SPB
- **Susep** — para descumprimento OPIN
- **CADE** — concorrência (se houver indícios de prática anticompetitiva)
- **CVM** — mercado de capitais

### Magnitude qualitativa

- **Multas técnicas leves** (ex: SLA descumprido pontualmente): podem ser **dezenas a centenas de milhares de reais**
- **Multas pesadas** (descumprimento sistemático, dano ao consumidor): podem chegar a **milhões de reais**, com escalonamento por reincidência
- **Sanções não-monetárias:** suspensão de operação, restrição cautelar, descredenciamento

### Onde a engenharia entra

Quase toda **multa técnica** é evitável com boa engenharia:
- SLA descumprido → resilience + capacity planning
- Vazamento de dados → mTLS + secrets management
- Não-conformidade ao manual → testes contratuais + ArchUnit + revisão de schema
- Auditoria reprovada → logs estruturados + retenção correta

> **🔑 Frase poderosa pra call:** *"O custo de não-conformidade técnica não é só a multa direta — é o risco de ser descredenciado e perder a operação inteira. Por isso adequação não é despesa, é seguro."*

---

## Capítulo 28 — mTLS e ICP-Brasil em profundidade

> Mesmo sem ser specialista em PKI, **você precisa saber explicar isso em call**. Toda integração regulatória crítica usa.

### Por que mTLS?

**TLS unilateral** (HTTPS comum): o **cliente verifica** que o servidor é quem diz ser (cert do servidor). Servidor confia no cliente via outro mecanismo (ex: token).

**mTLS — Mutual TLS:** cliente verifica servidor **E** servidor verifica cliente, ambos com certs. Ninguém entra na conversa sem prova criptográfica de identidade.

### Por que regulação financeira exige

- **Token vaza** → atacante consegue fingir ser o cliente
- **Cert privado vaza** → mais difícil (geralmente em HSM, hardware security module)
- mTLS dá **autenticação bilateral forte e baseada em hardware** (com certs em HSM)

### O que é ICP-Brasil

**Infraestrutura de Chaves Públicas Brasileira**. PKI **soberana brasileira**, criada por lei e operada pelo ITI (Instituto Nacional de Tecnologia da Informação).

Estrutura:
```
Autoridade Certificadora Raiz Brasileira (AC-Raiz)
    │
    ├── AC Nível 2 (Serasa, Certisign, Soluti, etc.)
    │       │
    │       └── Cert da sua empresa (CN=XXX, CNPJ=...)
    │
    └── ... outras ACs
```

Pra obter cert ICP-Brasil:
1. Empresa contrata uma AC credenciada (ex: Certisign)
2. Faz **validação presencial** (alguém vai num posto de validação com docs da empresa)
3. Recebe cert em **token criptográfico físico** (pendrive USB) ou **HSM**
4. Cert é válido por X meses (geralmente 1–3 anos)

### Custos típicos

- Cert ICP-Brasil A1 (em arquivo) = ~R$ 200–400/ano
- Cert ICP-Brasil A3 (em token) = ~R$ 300–600/ano
- HSM dedicado = R$ 10k–50k/ano

> **⚠️ Pra dev:** em **homologação/sandbox** do BCB, geralmente você pode usar cert auto-assinado ou cert de uma CA test. **Em produção, é ICP-Brasil obrigatório**.

### O que sua implementação precisa fazer

1. **Carregar o cert** (de arquivo, keystore, HSM, ou Vault)
2. **Validar a cadeia** do cert do servidor contra a cadeia ICP-Brasil
3. **Apresentar seu cert** na handshake TLS
4. **Renovar antes de expirar** (esquecer = perder produção, multa)
5. **Logs de toda chamada com cert ID** (auditoria)

### No seu projeto `dict-client-reference`

Você usou **Spring Boot SSL Bundle** (`spring.ssl.bundle.jks.dict-prod`). É o método moderno e correto. Seu README diz "ICP-Brasil ready" — quando o cliente fornecer o cert/keystore real, é só apontar a config.

---

## Capítulo 29 — Logs, auditoria e observabilidade regulatória

> Aqui mora um dos seus maiores diferenciais como dev consultor: **observabilidade séria**.

### O que precisa ser logado (em ordem de criticidade)

1. **Cada chamada outbound** (Pix, DICT, Open Finance) — com request ID, payload hash, response status, latência
2. **Cada decisão de autorização** (ex: "rejeitamos pagamento porque saldo X")
3. **Cada erro de validação** — formato, schema, regra de negócio
4. **Mudanças de configuração** — quem mudou, quando, valor antigo vs novo
5. **Acessos administrativos** — login admin, mudança de chave, etc.

### Formato

**JSON estruturado** (one-line-per-record). Por quê:
- Parseable por SIEM (Splunk, Elastic, Datadog)
- Fácil de filtrar
- Fácil de exportar pro auditor

```json
{
  "timestamp": "2026-04-26T14:30:15.123Z",
  "level": "INFO",
  "trace_id": "abc-123-xyz",
  "service": "dict-client",
  "operation": "lookup",
  "key_type": "PHONE",
  "key_masked": "+55119****9999",
  "duration_ms": 187,
  "outcome": "SUCCESS",
  "cache_hit": false,
  "psp_target": "BCB-DICT-PROD"
}
```

> **⚠️ NUNCA logue:** chave Pix completa, CPF/CNPJ completo, valor de transação ligado a CPF, números de cartão (mesmo parciais), credenciais. Tudo isso vai contra LGPD + regras BCB.

### Retenção

Logs financeiros geralmente devem ser retidos por **5 anos** (verificar regra específica). Use armazenamento barato (S3 Glacier, Azure Cool Tier) pra logs frios.

### Métricas que importam

- **Latência percentil 95 e 99** das chamadas a infra externa (DICT, SPI, OF)
- **Taxa de erro** por tipo (4xx, 5xx, timeouts)
- **Taxa de cache hit** (especialmente DICT)
- **Estado dos circuit breakers** (open, half-open, closed)
- **Reservas de capital usadas** (financeiro)
- **Volume de transações por minuto/hora**

### Dashboards

Você implementou no `dict-client-reference`:
- `dict-overview` (11 painéis) — operação geral
- `dict-resilience` (10 painéis) — saúde dos circuit breakers, retry, rate limit

**Isso é diferencial.** Maioria dos repos open source brasileiros tem **logs e talvez Prometheus**, mas dashboard versionado como código é raro. Vende.

### Tracing distribuído

Quando uma transação Pix passa por **3+ serviços** (cliente → backend → DICT → SPI → notificação), você precisa de **trace ID único** que cruza tudo.

**Padrão:** **W3C Trace Context** (`traceparent` header). Suportado pelo OpenTelemetry. Implementado nos seus repos.

---

## Capítulo 30 — Padrões de implementação que sinalizam senioridade

> Esta seção é **ouro pra call técnica**. Cada um desses termos, usado corretamente, te diferencia.

### 1. Idempotência

Operação que pode ser executada **N vezes com o mesmo resultado**. Crítico em pagamentos: se um Pix der timeout, você não pode duplicar a cobrança ao reexecutar.

**Como:**
- Header `Idempotency-Key` (UUID gerado pelo cliente) em cada operação POST/PUT
- Servidor armazena resultado por TTL — se receber mesmo key, retorna resultado cacheado
- Camadas: API gateway, service, banco

### 2. Outbox Pattern

Pra **garantir entrega** de evento mesmo se o serviço cair: salva o evento numa tabela "outbox" na MESMA transação que muda o estado. Worker assíncrono consome a outbox e publica o evento (Kafka, webhook, etc.).

**Por que importa:** se você notifica cliente sobre Pix antes de garantir que salvou, e o serviço cai, você ficou inconsistente. Outbox previne isso.

### 3. Saga Orquestrada

Transação distribuída que **não pode ser ACID**. Ex: criar consent → autorizar → debitar → notificar. Se passo 3 falha, precisa **compensar** os passos 1 e 2.

Saga orquestrada: um **orquestrador central** comanda os passos e dispara compensações.

### 4. Circuit Breaker

Quando uma dependência (DICT, SPI) fica lenta/down, em vez de continuar batendo nela e propagando lentidão, **abre o circuito**: passa a falhar rapidamente. Depois de cooldown, tenta de novo.

**Resilience4j** é o padrão Java pra isso.

### 5. Bulkhead

Isolar pools de threads/conexões por **dependência ou criticidade**. Se DICT degrada, não consome todas as threads do app — só seu pool dedicado.

### 6. Retry com Backoff Exponencial

Falhou? Tenta de novo, **mas com delay crescente**. Evita "thundering herd" quando um service volta.

### 7. Hexagonal Architecture (Ports & Adapters)

Camada `domain/` não conhece Spring, JPA, HTTP. Toda integração externa entra via "port" (interface) e "adapter" (implementação concreta). **Permite testar regra de negócio sem subir Postgres ou DICT.**

Você usa ArchUnit no `dict-client-reference` pra **garantir** que essa regra não é violada acidentalmente.

### 8. Mascaramento

CPF, conta, valor, chave Pix sempre logados/exibidos **mascarados**. Padrão: mostra primeiro/último, esconde meio. `***123***`.

### 9. Sender-Constrained Tokens (mTLS)

Token OAuth só funciona com o **mesmo cert mTLS** que o pegou. Se vazar token, atacante não consegue usar (precisaria do cert privado também).

### 10. Conformance Suite

Quando o regulador (BCB, OFB, Susep) tem **suite de testes oficial**, você roda contra a sua implementação **antes de produção**. Resultado pode ser exigido em homologação.

> **🔑 Quando você usar 3-4 desses termos numa call de 30min, naturalmente, seu interlocutor te credibiliza imediatamente como sênior. Não precisa decorar — precisa **entender** cada um e onde se aplica.**

---

> **📍 Onde estamos:** OPIN, compliance, mTLS/ICP-Brasil, observabilidade e padrões cobertos. Faltou só uma parte: **o cheat sheet pra call** — perguntas, respostas, frases-modelo. Vamos lá.

