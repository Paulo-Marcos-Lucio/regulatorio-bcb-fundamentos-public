# PARTE II — Pix: do conceito à última atualização

> O Pix é o **carro-chefe** da modernização do sistema de pagamentos brasileiro. Se você vai prestar consultoria em pagamentos no Brasil em 2026, **você tem que dominar Pix**. Esta parte cobre da motivação histórica até as últimas evoluções (Pix Automático, NFC).

---

## Capítulo 5 — Por que o Pix existe (o problema que resolveu)

Antes de novembro de 2020, mover dinheiro entre bancos no Brasil era ruim. Sério.

### O cenário antes do Pix

| Forma | Custo | Tempo | Limites |
|---|---|---|---|
| **TED** | R$ 5–15 (PF), R$ 30+ (PJ) | Horário comercial, mesma janela liquidação | Sem limite, mas SLA travado |
| **DOC** | R$ 5–10 | D+1 (chega só no próximo dia útil) | Limite até R$ 4.999,99 |
| **Boleto** | R$ 1–5 (emitir) | Compensação até D+3 | Limite alto |
| **Cheque** | R$ 0–2 | Compensação D+1 a D+3 | — |

Problemas:
1. **Caro** — fintech tinha que repassar custo TED ao cliente
2. **Lento** — fim de semana, feriado, depois das 17h: nada funcionava
3. **Excludente** — quem não tinha conta corrente (35% dos brasileiros, à época) ficava de fora
4. **Privado** — a CIP (operadora privada) cobrava taxas dos bancos pra liquidar TEDs

### O objetivo declarado do BCB ao criar o Pix

Em ordem de prioridade, segundo o próprio BCB:

1. **Promover competição e inclusão financeira** — fintech pequena pode competir com banco grande
2. **Reduzir custo de transação** (em escala nacional, isso libera bilhões/ano)
3. **Acelerar o ecossistema** (e-commerce, microempreendedor, P2P)
4. **Substituir o uso de papel-moeda** (custo de fabricação, transporte, segurança da Casa da Moeda)

### Resultado, em números (qualitativos)

- Pix passou TED, DOC, boleto e cartão em volume de transações em poucos anos
- Brasil virou referência mundial em pagamentos instantâneos (estudado pelo FMI, BIS)
- Um produto regulatório virou **infraestrutura crítica** — um dia inteiro de Pix offline pararia o varejo do país

> **🔑 Pra call:** quando alguém perguntar "por que Pix é estratégico?", você pode responder em uma frase: *"Porque é a primeira infraestrutura nacional de pagamentos pública, gratuita pra pessoa física, 24/7, e que nivelou o jogo entre incumbentes e fintechs."*

---

## Capítulo 6 — Arquitetura macro do Pix

Vamos olhar quem fala com quem.

### Os atores

```
        ┌─────────────────────────────────────────┐
        │              BANCO CENTRAL              │
        │  ┌──────────┐    ┌──────────────────┐  │
        │  │   SPI    │    │   DICT           │  │
        │  │ (liquid.)│    │ (chaves)         │  │
        │  └──────────┘    └──────────────────┘  │
        └────────▲──────────────────▲────────────┘
                 │                  │
       ┌─────────┘                  └──────────┐
       │                                       │
   ┌───▼────────┐                       ┌──────▼─────┐
   │ PSP do     │   mensageria SPI      │ PSP do     │
   │ Pagador    │◄──────────────────────│ Recebedor  │
   │ (ex: Itaú) │                       │ (ex: Inter)│
   └───▲────────┘                       └──────▲─────┘
       │                                       │
   ┌───▼────────┐                       ┌──────▼─────┐
   │  Pagador   │                       │ Recebedor  │
   │ (cliente   │                       │ (cliente   │
   │  Itaú)     │                       │  Inter)    │
   └────────────┘                       └────────────┘
```

### Os 3 papéis principais

| Papel | Quem é | O que faz |
|---|---|---|
| **PSP do Pagador** | Banco/IP do quem manda | Inicia a operação, debita o pagador |
| **PSP do Recebedor** | Banco/IP do quem recebe | Credita o recebedor |
| **BCB** | Banco Central | Opera SPI (liquidação) e DICT (chaves) |

### Os dois sistemas centrais do BCB

1. **SPI** — Sistema de Pagamentos Instantâneos. **Liquida** o dinheiro entre os bancos. É a "linha de produção" do Pix.
2. **DICT** — Diretório de Identificadores de Contas Transacionais. **Resolve a chave** (CPF, e-mail, etc.) pro número de conta de verdade. É o "DNS" do Pix.

> **💡 Analogia que funciona em call:** o **DICT é como o DNS da internet**. Você digita `google.com` (chave), o DNS resolve pro IP `142.250.x.x` (conta real). No Pix, você digita o e-mail do recebedor (chave), o DICT resolve pro CPF + agência + conta dele.

### Por onde a transação passa fisicamente

1. App do Pagador → API do PSP do Pagador
2. PSP do Pagador → DICT (consulta a chave)
3. PSP do Pagador → SPI (envia ordem de pagamento)
4. SPI → liquida (movimenta reservas no BCB)
5. SPI → PSP do Recebedor (notifica)
6. PSP do Recebedor → app do Recebedor (notifica push)

Tudo isso precisa acontecer em **menos de 10 segundos** segundo o SLA do BCB.

---

## Capítulo 7 — Anatomia de uma transação Pix passo-a-passo

Vamos pegar o caso real: **João (cliente Itaú) manda R$ 50 pra Maria (cliente Nubank), usando a chave-celular dela**.

### Fluxo completo (timestamps reais)

```
T=0ms      [João] abre app Itaú, digita celular da Maria, R$ 50
T=10ms     [App Itaú] valida formato, envia ao backend
T=20ms     [Itaú] consulta DICT: GET /entries/+5511999999999
T=200ms    [DICT] responde: { ispb: "18236120", agência: "0001",
                              conta: "12345-6", nome: "Maria Silva",
                              cpf: "***.123.456-**" }
T=210ms    [App Itaú] mostra "Confirma pagamento de R$ 50,00 a
                       Maria S***?". João confirma.
T=300ms    [Itaú] valida saldo, debita R$ 50 da conta de João
T=350ms    [Itaú] monta mensagem Pix (pacs.008) e envia ao SPI
T=600ms    [SPI] valida mensagem, debita reservas Itaú no BCB
T=700ms    [SPI] credita reservas Nubank no BCB
T=800ms    [SPI] envia mensagem ao Nubank com a credencial
T=1100ms   [Nubank] credita R$ 50 na conta de Maria
T=1200ms   [Nubank] envia push notification a Maria
T=1300ms   [Nubank] confirma ao SPI: "creditado"
T=1500ms   [SPI] confirma ao Itaú: "operação completa"
T=1600ms   [Itaú] mostra a João: "Pagamento realizado"
```

Tempo total típico: **1–3 segundos**. SLA máximo do BCB: **10 segundos**.

### As mensagens (padrão ISO 20022)

O Pix usa o padrão internacional **ISO 20022** pra mensageria. As mensagens chave:

| Código | Tipo | Quando |
|---|---|---|
| `pacs.008` | Pagamento (FI to FI Customer Credit Transfer) | PSP do Pagador → SPI → PSP do Recebedor |
| `pacs.002` | Status Report | Confirmação ou rejeição |
| `pacs.004` | Devolução (Payment Return) | MED, cancelamento |
| `camt.029` | Resolução de investigação | Resposta de investigação manual |

> **🔑 Pra call:** "**ISO 20022**" e "**pacs.008**" são termos que sinalizam senioridade. Se a fintech está construindo cliente Pix do zero, eles vão lidar com esses formatos. Saber que existe e o papel deles já te diferencia.

### Onde os erros mais comuns acontecem

1. **Chave não encontrada** (DICT retorna 404) — recebedor não tem chave cadastrada com aquele identificador
2. **Saldo insuficiente** (PSP do Pagador rejeita) — antes mesmo de chegar no SPI
3. **Timeout no SPI** — SPI deve responder em < 5s, se passar disso o Pagador devolve erro
4. **Conta destino fechada/bloqueada** — PSP do Recebedor rejeita, SPI estorna
5. **Fraude detectada** — PSP do Pagador ou Recebedor pode bloquear pré-emissão

---

## Capítulo 8 — Modalidades de Pix

Não tem "um" Pix. Tem várias formas de iniciar.

### 1. Pix por chave

A mais comum. Pagador digita ou seleciona a chave do recebedor. **Tipos de chave**:

| Tipo | Formato | Quem usa | Limite/conta |
|---|---|---|---|
| **CPF** | 11 dígitos | PF | 1 por CPF |
| **CNPJ** | 14 dígitos | PJ | 1 por CNPJ |
| **E-mail** | RFC válido | PF e PJ | 5 (PF) ou 20 (PJ) |
| **Celular** | +55 + DDD + número | PF e PJ | 5 (PF) ou 20 (PJ) |
| **EVP** (Chave Aleatória) | UUID | PF e PJ | sem limite específico |

> **💡 EVP — "Endereço Virtual de Pagamento"** é o nome formal da chave aleatória (UUID). Se você não quer expor seu CPF/celular/e-mail, gera uma EVP, manda pra quem te paga. Boa prática pra anúncios públicos.

### 2. Pix por dados bancários (sem chave)

Pagador digita: ISPB do banco + agência + conta + tipo (corrente/poupança) + CPF/CNPJ. Funciona, mas é UX ruim — quase ninguém usa.

> **🔑 ISPB — Identificador do Sistema de Pagamentos Brasileiro** é o "código do banco" no Pix. Itaú = 60701190, Nubank = 18236120, Inter = 00416968. Cada PSP tem o seu.

### 3. Pix por QR Code estático

Recebedor gera **uma vez** um QR Code que carrega: chave + valor (opcional) + identificador. Imprime, cola na parede do bar. Cliente paga lendo com câmera.

- Vantagem: simples, offline-friendly pro recebedor
- Desvantagem: valor pré-definido (ou em branco) e ID estático — difícil reconciliar

### 4. Pix por QR Code dinâmico

Recebedor gera **um QR diferente por venda**, com **valor exato + identificador único**. O QR aponta pra uma URL HTTPS do PSP do recebedor que retorna o JWS com os dados.

- Vantagem: reconciliação perfeita, valor sempre correto
- Padrão pra **e-commerce e maquininha física**

### 5. Pix Copia-e-Cola

É o **payload do QR Code dinâmico em formato texto**. Você gera o "BR Code" (string codificada), cola no chat, no e-mail. O pagador cola no app do banco e paga. Mesma estrutura técnica do QR dinâmico, sem a imagem.

### 6. Pix Saque e Pix Troco

- **Pix Saque:** você usa o Pix pra **sacar dinheiro** num caixa de varejista (mercado, farmácia). O varejista te dá dinheiro físico, e você manda Pix pra ele de igual valor.
- **Pix Troco:** você compra algo + saca um valor adicional na mesma operação Pix.
- Ambos: o BCB pretendeu **substituir o saque em ATM**. Adoção é menor que o esperado.

### 7. Pix Automático *(novo, lançado out/2025)*

Cobertura completa no **Capítulo 10**. É a versão Pix do **débito automático**.

### 8. Pix por Aproximação (NFC) *(novo, em rollout)*

Cobertura completa no **Capítulo 11**. Pagar Pix encostando o celular na maquininha, sem QR.

---

## Capítulo 9 — Regras críticas: irreversibilidade, MED, e devolução

Aqui mora a maior dor de cabeça operacional do Pix.

### Irreversibilidade

Pix é **irreversível por padrão**. Uma vez liquidado, o dinheiro saiu da sua conta e foi pra do recebedor. **Não tem chargeback** como em cartão de crédito.

**Por que:** o BCB queria velocidade e finalidade da liquidação. Se fosse reversível, o sistema teria que segurar valores, complicaria tudo.

**Implicação:** se você manda Pix pro CPF errado, o dinheiro foi. **Você precisa pedir devolução voluntária**.

### Devolução voluntária

O recebedor pode (e em muitos casos deve) **devolver voluntariamente** valores recebidos por engano. Não é obrigatório por lei pra todo caso, mas:
- Bancos boniticios têm fluxo de "devolução" no app
- Tecnicamente é uma nova transação Pix do recebedor pro pagador (mensagem `pacs.004`)

### MED — Mecanismo Especial de Devolução

Foi criado pra **fraudes e golpes**. Funciona assim:

1. Pagador denuncia ao seu PSP que foi vítima de golpe
2. PSP do Pagador abre **MED** (Mecanismo Especial de Devolução) via SPI
3. PSP do Recebedor é obrigado a **bloquear** o valor (se ainda tiver na conta)
4. Investigação ocorre (pode ser manual)
5. Se confirmado golpe, valor é devolvido ao pagador

**Prazos** (verificar versão atual do Manual): a devolução via MED tem janela específica — *"até X dias úteis após a transação"*, conforme manual.

> **⚠️ Atenção em call:** se cliente pergunta "como funciona devolução", a resposta tem 3 camadas:
> 1. **Voluntária** — recebedor devolve por boa vontade
> 2. **MED por fraude/golpe** — caminho regulatório, bloqueio de saldo, prazos curtos
> 3. **Investigação por erro operacional** — caso a caso

### Bloqueio cautelar

Se o PSP do recebedor detecta padrão suspeito (recebimento muito acima do perfil, vários CPFs pagando ao mesmo CNPJ pequeno, etc.), pode **bloquear preventivamente**. Isso é regulamentado e há prazos.

---

## Capítulo 10 — Pix Automático

> Lançado em **outubro de 2025**. É o **substituto regulatório do débito automático**. Provavelmente vai dominar cobrança recorrente nos próximos anos.

### O que é

Pix Automático permite que um recebedor (digamos, sua academia) **debite seu Pix de forma recorrente** mediante **autorização prévia** do pagador.

### Diferença vs débito automático tradicional

| Característica | Débito Automático | Pix Automático |
|---|---|---|
| Onde mora | Banco (relacionamento bilateral) | Pix (regulado pelo BCB) |
| Cadastro | Manual no banco | Pix QR ou link |
| Mudança de banco | Refazer tudo | Carrega o consentimento |
| Cancelamento | Liga pra empresa | Botão no app do banco, qualquer hora |
| Falhas | Recebedor tenta de novo manual | Retentativas automatizadas reguladas |
| Valor variável | Limitado | Suportado (ex: conta de luz) |
| Padrão | Sem padrão (cada banco diferente) | Padrão BCB unificado |

### Atores e fluxo

1. **Recebedor** (ex: academia) tem CNPJ habilitado pra Pix Automático e gera um **QR de autorização**
2. **Pagador** lê o QR no app do banco, vê os termos (valor, periodicidade, prazo, máximo), **autoriza**
3. PSP do Pagador registra o **consentimento** com o BCB
4. Na data agendada, recebedor **dispara cobrança** via SPI
5. SPI valida que existe consentimento ativo e dentro dos limites
6. Pix é executado normalmente

### Tipos de cobrança suportados

- **Valor fixo recorrente** (assinatura mensal de academia)
- **Valor variável** (conta de água, luz)
- **Periodicidade flexível** (semanal, mensal, anual)
- **Tentativa-única** (boleto-like)
- **Retentativas automáticas** (até N tentativas se falhar por saldo insuficiente, com janela definida)

### Cancelamento

Pagador pode cancelar **a qualquer momento** pelo app do PSP. Recebedor é notificado.

### Por que isso é estratégico

Boletos têm taxa alta (R$ 1–5 por emissão), tempo de compensação D+1, e UX ruim no cliente. Débito automático é cativo do banco. **Pix Automático combina baixo custo + UX boa + portabilidade entre bancos.**

> **🔑 Pra call:** quando uma fintech de cobrança (ex: subscriber-billing, gateways tipo Vindi, Iugu) busca consultoria em Pix Automático em 2026, o que ela quer entender é: **como migrar a base de boletos recorrentes pra Pix Automático sem quebrar reconciliação**. Esse é o produto.

### Onde seu projeto `pix-automatico-reference` se encaixa

Você implementou:
- **Saga orquestrada** pra criação de consentimento → emissão da cobrança → liquidação
- **Outbox** pra garantir que evento de pagamento confirmado vire baixa no ERP do cliente
- **Idempotência em 3 camadas** porque retentativas no Pix Automático são REGRA, não exceção

Esses são os **3 padrões críticos** que diferenciam um cliente Pix Automático production-grade de uma POC.

---

## Capítulo 11 — Pix por Aproximação (Pix NFC)

> **Spec recém-publicada pelo BCB.** Em rollout. Janela curta pra se posicionar como referência.

### O que é

Pagar Pix **encostando o celular** na maquininha do varejista, sem precisar abrir QR. Mesma UX do **Apple Pay / Google Pay** mas usando o protocolo Pix por baixo.

### Como funciona tecnicamente

Usa **NFC + HCE (Host Card Emulation)**. Resumo:

1. Maquininha do varejista emite sinal NFC com **payload de cobrança Pix**
2. App do banco no celular do pagador lê via HCE
3. App valida, mostra "Pagar R$ X em Loja Y?"
4. Pagador autoriza (biometria/PIN)
5. App envia Pix normalmente via SPI

A diferença do QR é **só o canal de captura do payload**. A liquidação é Pix puro.

### Por que importa

- **Velocidade na fila** — encostar > escanear QR
- **Inclusão** — celulares sem câmera boa, idosos com dificuldade pra mira
- **Maquininha simples** — não precisa de tela, só NFC + chip pequeno

### Status atual

Em **fase de adoção** — alguns bancos já lançaram, outros estão integrando. Maquininhas de pagamento (Stone, Cielo, Rede) estão rolando atualizações de firmware.

### Sua aposta com `pix-nfc-reference`

Como a spec é nova, **quase não tem implementação open source pública**. Quem publicar referência sólida agora vira **a fonte canônica** que devs novos vão consultar. Janela de 6–12 meses até virar commodity.

---

## Capítulo 12 — Pix Saque e Pix Troco

> Cobertura curta porque adoção é baixa. Mas se aparecer em call, você sabe responder.

### Pix Saque

Você quer dinheiro físico. Vai num varejo conveniado (farmácia, mercado), pede saque de R$ X. O caixa registra como "venda Pix Saque" no PDV. Você lê o QR e paga R$ X via Pix. Caixa te entrega R$ X em dinheiro.

**Quem ganha:** o varejista recebe **um pequeno percentual** do BCB pelo serviço (compensa o trabalho do caixa).

### Pix Troco

Compra de R$ 30 + saque de R$ 50 = pagamento Pix de R$ 80, varejista te dá R$ 50 em dinheiro de troco.

### Por que existem

Substituir o saque em ATM (caro pra banco manter, escasso em algumas regiões). Adoção tem sido lenta — costume cultural e UX ainda em ajuste.

---

## Resumo da Parte II — pontos pra ter na ponta da língua

| Pergunta provável | Resposta de 1 frase |
|---|---|
| "Por que o Pix é importante?" | Substituiu TED/DOC pagos por infra pública gratuita 24/7, nivelou competição banco vs fintech |
| "Quem opera o Pix?" | O BCB opera SPI (liquidação) e DICT (chaves); PSPs são as instituições autorizadas a transacionar |
| "O Pix é reversível?" | Não, irreversível por padrão. Devolução só voluntária ou via MED em caso de fraude |
| "O que muda com Pix Automático?" | Substitui débito automático: padrão BCB, cancelamento livre, portabilidade entre bancos, valor variável |
| "Por que Pix usa ISO 20022?" | Padrão internacional de mensageria financeira — facilita interop e auditoria |
| "Qual a vantagem do Pix NFC?" | Velocidade no PDV (encostar > escanear QR), igual Apple Pay mas com infra Pix |

> **📍 Onde estamos:** acabamos de cobrir tudo de Pix do conceito ao novíssimo. Você sabe a história, os atores, os fluxos, as modalidades, e os termos-chave. **A próxima parte mergulha no DICT** — o "DNS" do Pix, e o tema do seu segundo repo.

