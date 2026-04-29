[![Suíte Regulatória BR](https://img.shields.io/badge/%F0%9F%8C%90%20Su%C3%ADte%20Regulat%C3%B3ria%20BR-paulo--marcos--lucio.github.io-3fb950?style=for-the-badge)](https://paulo-marcos-lucio.github.io)

# Regulatório Financeiro Brasileiro — Fundamentos

> Guia técnico introdutório aos sistemas regulados pelo Banco Central do Brasil
> e pela Susep que todo engenheiro de fintech, banco médio ou seguradora
> precisa entender antes de tocar código de Pix, DICT, Open Finance ou
> Open Insurance.
>
> **Escrito do zero, sem assumir conhecimento prévio de finanças.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PT-BR](https://img.shields.io/badge/lang-PT--BR-green.svg)](#)
[![PDF Build](https://img.shields.io/badge/build-Node%20+%20Puppeteer-blue.svg)](#como-gerar-o-pdf)

---

## O que é este material

Cinco partes cobrindo o núcleo do regulatório financeiro brasileiro relevante pra
quem implementa integrações com **BCB, OFB e Susep**:

| Parte | Conteúdo |
|---|---|
| **I — Fundamentos do SFN** | O que é banco "no fundo", tipos de IF (BC, IP, SCD, SEP), SPB/SPI/STR, BCB/CMN/Susep/CVM, pirâmide regulatória |
| **II — Pix** | Motivação, arquitetura, fluxo passo-a-passo, modalidades, MED, Pix Automático, Pix por Aproximação (NFC), Saque/Troco |
| **III — DICT** | Conceito, tipos de chave, atores, operações REST, cache regulatório, mTLS com ICP-Brasil |
| **IV — Open Finance Brasil** | 4 fases (Phase 1 a 4), papéis (Detentora/Receptora/PISP/Diretório), FAPI 2.0 + Brasil profile, consents, JWS detached signature |
| **V — OPIN + Compliance** | Open Insurance (FAPI-CIBA, Susep), tipos de risco, multas qualitativas, mTLS profundo, observabilidade e padrões de senioridade |

## Pra quem é

- **Engenheiros pleno/sênior** chegando em fintech ou seguradora e precisando ramp up no contexto regulatório
- **Times de produto/PM** querendo entender o "porquê" das limitações técnicas que o backend impõe
- **Tech leads** preparando squads novos pra trabalho com Pix/Open Finance/Open Insurance
- **Estudantes** de Engenharia/Sistemas/Computação interessados em fintech/insurtech BR

## Por que existe

Material brasileiro técnico sobre regulatório financeiro está fragmentado: parte
em manuais oficiais (BCB v3.x, OFB v4.x, Susep) que assumem que você conhece o
contexto, parte em posts esparsos no Medium que assumem que você conhece os
manuais oficiais. Engenheiros que **não** são desse nicho ficam perdidos.

Este guia preenche a lacuna: começa explicando o que é banco no fundo e termina
em FAPI 2.0 + JWS detached + observabilidade regulatory-grade — sem pular
degraus.

## Como ler

- **Linearmente** (Parte I → V) se você é leigo em regulatório BR
- **Por seção** (Parte II ou III ou IV) se já tem contexto e quer aprofundar um domínio específico
- **Como referência** (índice + capítulos) se já leu uma vez e quer revisar pontos específicos

Cada parte tem ~30-50 páginas no PDF. Total ~250 páginas (descontando capa e TOC).

## Disclaimer

> Este é **material introdutório/educacional**. Valores específicos
> (TTLs de cache, limites de rate, multas, SLAs) **mudam entre versões** dos
> manuais oficiais. Sempre valide número exato contra:
>
> - **Manual do DICT** (BCB) — versão atual em [bcb.gov.br/estabilidadefinanceira/pix](https://www.bcb.gov.br/estabilidadefinanceira/pix)
> - **Manual de Operações OFB** — em [openbankingbrasil.org.br](https://openbankingbrasil.org.br)
> - **Padrões Open Insurance** — em [opinbrasil.com.br](https://opinbrasil.com.br)
> - **Resoluções BCB / Circulares Susep** vigentes
>
> Este guia explica os **conceitos** e **arquitetura** que persistem entre versões.

## Como gerar o PDF

Pré-requisitos: Node.js 18+, Google Chrome instalado em
`C:/Program Files/Google/Chrome/Application/chrome.exe` (ou edite o path em
`build.js`).

```bash
npm install
node build.js
```

Output: `regulatorio-bcb-fundamentos-public.pdf` (~2.3 MB, ~250 páginas).

Os 5 markdowns ficam em `01-parte-*.md` a `05-parte-*.md`. `style.css` é o
print stylesheet (estilo livro técnico — fonte serif Source Serif 4 pra texto,
Inter pra headings, JetBrains Mono pra code, callouts azul/laranja, tabelas
com header BCB-blue). `build.js` orquestra: marked v14 pra markdown→HTML,
puppeteer-core pra Chrome local → PDF A4 com header/footer/page numbers.

## Suíte de Referência Regulatória BR

Este material é o **complemento conceitual** da minha **Suíte de Referência
Regulatória BR** — 5 repos open source com implementações Java production-grade
das integrações descritas aqui:

- [`pix-automatico-reference`](https://github.com/Paulo-Marcos-Lucio/pix-automatico-reference) — Pix Automático full-stack
- [`dict-client-reference`](https://github.com/Paulo-Marcos-Lucio/dict-client-reference) — cliente DICT do BCB
- [`pix-nfc-reference`](https://github.com/Paulo-Marcos-Lucio/pix-nfc-reference) — Pix por aproximação (NFC)
- [`open-finance-payments-reference`](https://github.com/Paulo-Marcos-Lucio/open-finance-payments-reference) — Iniciador de Pagamento (PISP)
- [`open-insurance-transmissor-reference`](https://github.com/Paulo-Marcos-Lucio/open-insurance-transmissor-reference) — Transmissor de Dados OPIN

Cada repo tem hexagonal validada por ArchUnit, observabilidade end-to-end
(Prometheus + Tempo + Loki + Grafana), CI 7+ jobs paralelos, ADRs documentando
cada decisão arquitetural. **Estude o conceito aqui, veja o código lá.**

## Licença

[MIT](LICENSE) — use, modifique, distribua. Atribuição apreciada.

## Autor

**Paulo Marcos Lucio** — Engenheiro Java pleno · Consultor em integrações
regulatórias BR

[LinkedIn](https://www.linkedin.com/in/paulo-marcos-a07379174/) ·
[GitHub](https://github.com/Paulo-Marcos-Lucio) ·
pmlsp23@gmail.com

> Se este guia ajudou, ⭐ uma star no repo — ajuda outros engenheiros do nicho a encontrarem.
