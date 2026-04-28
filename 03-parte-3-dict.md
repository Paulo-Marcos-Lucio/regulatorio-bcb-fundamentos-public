# PARTE III — DICT: o "DNS" do Pix

> O **DICT — Diretório de Identificadores de Contas Transacionais** é o sistema central do BCB que **resolve uma chave Pix** (CPF, e-mail, celular, EVP) **pra os dados reais da conta**. Sem DICT, você não tem Pix por chave. Esta é a base do seu segundo repo (`dict-client-reference`).

---

## Capítulo 13 — O que é DICT, e por que ele existe

### O problema

Pra pagar alguém via Pix, eu preciso saber o **endereço da conta** do recebedor: ISPB do banco + agência + conta + tipo de conta + CPF/CNPJ. Se eu tivesse que pedir tudo isso pra alguém **toda vez** antes de pagar, a UX seria igual TED. Tortura.

### A solução

**Substituir esse endereço gigante por um identificador simples** que a pessoa já tem: CPF, e-mail, celular, ou um UUID aleatório (EVP).

O DICT é o **diretório central** que mapeia:

```
chave (e-mail / CPF / celular / EVP)  →  dados da conta real
```

Cada PSP precisa **consultar o DICT** pra resolver a chave do recebedor antes de mandar Pix.

### Por que centralizado, não distribuído

Tecnicamente daria pra fazer com DNS-like distribuído. Mas o BCB centralizou pra:
1. **Garantir unicidade** (uma chave só pode estar registrada num PSP por vez)
2. **Auditoria** — qualquer mudança de chave passa pelo BCB
3. **Antifraude** — BCB consegue detectar padrões cross-bank
4. **Soberania regulatória** — chave é informação financeira sensível

> **🔑 Pra call:** "DICT é o registry central de chaves do Pix. Cada PSP tem que ser cliente do DICT pra resolver chaves do Pagador antes de iniciar uma transação."

---

## Capítulo 14 — Tipos de chave em detalhe

| Tipo | Formato exato | Validações importantes | Limite por titular |
|---|---|---|---|
| **CPF** | `12345678901` (11 dígitos) | Algoritmo de validação CPF; PF apenas | 1 chave por CPF |
| **CNPJ** | `12345678000190` (14 dígitos) | Algoritmo CNPJ; PJ apenas | 1 chave por CNPJ |
| **E-mail** | `pessoa@exemplo.com` (RFC 5322) | Validação de formato; verificação de posse via OTP | 5 (PF) ou 20 (PJ) |
| **Celular** | `+5511999999999` (E.164) | Verificação de posse via SMS OTP | 5 (PF) ou 20 (PJ) |
| **EVP** | `123e4567-e89b-12d3-a456-426614174000` (UUID v4) | Gerada pelo PSP, sempre única | sem limite específico (mas há limites totais por titular) |

### Verificação de posse

Antes de uma chave virar dela, o PSP precisa **provar que o titular possui aquele identificador**:

- **E-mail:** envia OTP pro endereço, titular cola o código no app
- **Celular:** envia SMS com OTP
- **CPF/CNPJ:** validação documental (já é da titularidade declarada na conta)
- **EVP:** não precisa, gerada pelo próprio PSP

Sem essa verificação, dava pra registrar `presidente@gov.br` como sua chave Pix. O DICT recusa registros sem comprovação.

### Portabilidade de chave

Uma chave pode **migrar entre PSPs**. Ex: você tem `meu@email.com` cadastrado no Itaú, quer migrar pro Inter.

Fluxo:
1. Você pede portabilidade no Inter
2. Inter manda **claim** ao DICT
3. DICT notifica Itaú: "estão pedindo essa chave, você libera?"
4. Itaú tem prazo pra **aceitar ou contestar**
5. Se aceitar (ou prazo vencer sem contestação), DICT transfere a chave
6. A partir desse momento, transações pra `meu@email.com` caem na conta Inter

> **💡 Esse fluxo de claim é parte do DICT que você implementou no `dict-client-reference`.** Tem regras temporais específicas (X dias úteis pra contestar) que estão no Manual do DICT.

### Reivindicação por posse

Se alguém registra `seu@email.com` indevidamente em outro PSP (e você consegue provar posse no seu PSP), você pode **reivindicar** com prioridade. É um sub-fluxo de claim com evidências.

---

## Capítulo 15 — Atores e papéis no DICT

```
        ┌──────────────────────────────────────┐
        │              DICT (BCB)              │
        │  ┌──────────────────────────────┐   │
        │  │ Diretório de Chaves           │   │
        │  │ (banco de dados central)      │   │
        │  └──────────────────────────────┘   │
        └─────────▲────────────▲───────────────┘
                  │            │
                  │ mTLS       │ mTLS
                  │            │
        ┌─────────┴───┐   ┌────┴────────────┐
        │ PSP DETENTOR │   │ PSP SOLICITANTE │
        │ (dono atual  │   │ (quem consulta  │
        │  da chave)   │   │  pra pagar)     │
        └──────────────┘   └─────────────────┘
```

### Papéis

- **PSP Detentor (Holder):** o PSP onde a chave está registrada hoje. Responde pelas operações daquela chave.
- **PSP Solicitante (Inquirer):** PSP que está consultando a chave (porque o cliente dele quer pagar pra essa chave).
- **PSP Doador / PSP Reivindicante:** em fluxos de portabilidade — quem está soltando a chave (doador) e quem está pegando (reivindicante).

### Como o PSP se conecta ao DICT

- **mTLS obrigatório** com **certificado ICP-Brasil** (cadeia de confiança da Autoridade Certificadora Raiz Brasileira)
- Endpoint do DICT é REST/JSON (em algumas operações **XML + JWS** — assinatura digital de payload)
- IP de origem precisa estar **whitelistado** no BCB (registrado em fila de homologação)

> **🔑 ICP-Brasil — Infraestrutura de Chaves Públicas Brasileira** é a PKI nacional. Certificados emitidos por ACs credenciadas (Serasa, Certisign, etc.). Você precisa de um certificado válido emitido sob essa cadeia pra falar com DICT, SPI e qualquer infra crítica do governo.

---

## Capítulo 16 — Operações do DICT

O DICT expõe um conjunto de operações REST. Vamos pelos principais:

### 1. Consulta (Lookup)

`GET /entries/{key}` — operação **mais frequente**. Toda transação Pix começa com isso.

**Request:**
```http
GET /entries/+5511999999999 HTTP/1.1
Host: dict.bcb.gov.br
PI-RequestingParticipant: 12345678
Authorization: ICP-Brasil mTLS cert
```

**Response (200 OK):**
```json
{
  "Entry": {
    "Key": "+5511999999999",
    "KeyType": "PHONE",
    "Account": {
      "Participant": "18236120",
      "Branch": "0001",
      "AccountNumber": "12345678",
      "AccountType": "CACC",
      "OpeningDate": "2023-05-12T00:00:00Z"
    },
    "Owner": {
      "Type": "NATURAL_PERSON",
      "TaxIdNumber": "***12345***",
      "Name": "Maria S***"
    },
    "CreationDate": "2024-03-01T10:00:00Z",
    "KeyOwnershipDate": "2024-03-01T10:00:00Z"
  }
}
```

**Response (404 Not Found):** chave não existe.

> **⚠️ Privacidade:** o DICT **mascara** o nome e CPF retornados. Você nunca recebe o CPF completo do recebedor — só os 6 dígitos do meio. Isso é proteção LGPD.

### 2. Cadastro (Create Entry)

`POST /entries` — quando seu cliente pede pra registrar uma chave. Você (PSP Detentor) registra com seu próprio mTLS.

Validações que o DICT faz:
- A chave já existe em outro PSP? Se sim, rejeita (precisa ser claim)
- Tem limites de chaves por titular? Não pode passar
- Os dados são consistentes? CPF dono bate com a conta?

### 3. Atualização (Update Entry)

`PATCH /entries/{key}` — pra atualizar dados (nome do titular, número da conta dentro do mesmo PSP).

### 4. Remoção (Delete Entry)

`DELETE /entries/{key}` — quando cliente pede pra excluir a chave dele.

### 5. Reivindicação / Portabilidade (Claim)

`POST /claims` — quando outro PSP quer pegar uma chave que tá com você.

Sub-operações:
- `POST /claims/{id}/confirm` — PSP doador confirma (libera)
- `POST /claims/{id}/cancel` — PSP doador contesta (bloqueia)
- `POST /claims/{id}/complete` — PSP reivindicante finaliza

Com prazos temporais específicos no manual.

### 6. Reportes de Infração / Fraude

`POST /infraction-reports` — registrar suspeita de uso fraudulento de uma chave.

`POST /fraud-markers` — marcar uma chave/conta como envolvida em fraude (compartilha info entre PSPs).

> **💡 Esses dois últimos são parte do `dict-claim` no seu projeto** — o grupo Resilience4j com retry conservador. São operações de baixo volume mas alta criticidade.

---

## Capítulo 17 — Regras de cache, segurança e SLA

### Cache regulatório

O DICT permite que PSPs façam **cache local** das respostas de lookup, mas **com limites máximos definidos pelo BCB**:

| Tipo de chave | TTL máximo permitido |
|---|---|
| CPF | (verificar manual atual) |
| CNPJ | (verificar manual atual) |
| E-mail | (verificar manual atual) |
| Celular | (verificar manual atual) |
| EVP | (verificar manual atual) |

> **⚠️ Atenção:** os valores exatos de TTL **mudam entre versões do Manual**. Não decora valor — decora o **conceito**: o BCB define um teto, e o PSP escolhe um TTL menor ou igual a esse teto.

> **🔑 No seu projeto `dict-client-reference`** — você implementou `RegulatoryCacheTtlPolicy` que **clampa o TTL configurado ao máximo BCB**. É essa regra. Documentado em `docs/compliance/bcb-mapping.md`.

### Por que cache importa

DICT cobra (sim, cobra) por consulta acima de um limite mensal. **Cache reduz custo + latência + carga no DICT**. Mas se você cachear demais (acima do TTL máximo), ficaria com dados desatualizados — e isso **viola a regra do BCB**, gerando multa.

### Segurança

- **mTLS obrigatório** com cert ICP-Brasil
- **Whitelisting de IP** no BCB
- Algumas operações têm **JWS** (assinatura JSON) ou **XML assinado** sobreposto ao mTLS (defesa em profundidade)
- Logs de auditoria de TODAS as chamadas — exigência regulatória, BCB pode requisitar

### SLA

O BCB define limites de latência e disponibilidade pro próprio DICT, e exige que PSPs respeitem certas regras:
- **Rate limit** por IP/CNPJ (excesso = 429)
- **Tempo máximo de resposta** que PSP deve aceitar antes de fallback
- **Disponibilidade mínima** que PSP deve garantir aos clientes

### Fraude e marcação

Quando uma chave é envolvida em fraude:
1. PSP do pagador registra `infraction-report`
2. PSP do recebedor é notificado
3. Investigação ocorre
4. Se confirmada, a chave/conta recebe um `fraud-marker`
5. Outros PSPs ao consultar essa chave **veem o marker** e podem rejeitar transações

Isso é o **antifraude colaborativo do BCB** — informação cruza PSPs via DICT.

---

## Resumo da Parte III — pontos pra call

| Pergunta provável | Resposta pronta |
|---|---|
| "O que é DICT?" | "Registry central de chaves Pix mantido pelo BCB; resolve chave (CPF/e-mail/celular/EVP) pros dados de conta reais" |
| "Como o PSP fala com DICT?" | "REST/JSON sobre mTLS com cert ICP-Brasil, IP whitelisted; algumas ops com JWS/XML assinado" |
| "Por que cache é importante?" | "Reduz latência, custo e carga; mas tem TTL máximo regulatório por tipo de chave que não pode ser ultrapassado" |
| "O que é claim?" | "Fluxo de portabilidade ou reivindicação de chave entre PSPs com prazo de contestação pelo doador" |
| "Como funciona antifraude no DICT?" | "PSPs registram infraction reports e fraud markers; informação compartilhada entre todos via DICT" |

> **📍 Onde estamos:** Pix e DICT cobertos. Você tem domínio do que sustenta os repos `pix-automatico-reference` e `dict-client-reference` da Suíte. **A próxima parte é o Open Finance Brasil** — o terreno dos próximos repos.

