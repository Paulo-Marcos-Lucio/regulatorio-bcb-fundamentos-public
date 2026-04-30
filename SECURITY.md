# Política de Segurança e Correções

Este repositório é um **material didático em PDF + Markdown** — não há código de produção a explorar. Mas erros de conteúdo regulatório podem desinformar leitores que estão começando no nicho. Por isso tratamos *correções factuais* com a mesma seriedade que outros repos da Suíte tratam vulnerabilidades.

## Versões suportadas

| Versão | Suportada |
|---|---|
| `main` (HEAD) | ✅ |
| Releases anteriores | ⚠️ apenas via novas releases — releases antigas refletem o estado dos manuais BCB/Susep da época |

## O que reportar via canal privado

Use o [canal privado de Security Advisory do GitHub](https://github.com/Paulo-Marcos-Lucio/regulatorio-bcb-fundamentos-public/security/advisories/new) para:

- **Erro factual de impacto regulatório** — número errado de TTL, limite de rate, valor de multa, prazo de SLA, fase do Open Finance/OPIN, papel de ator num fluxo
- **Outdated info que pode levar a decisão arquitetural errada** — versão antiga de manual citada como atual, FAPI 1.0 onde já é 2.0, regulamentação revogada apresentada como vigente
- **Citação errada de URL/regulamentação oficial** — link pra resolução, circular, ou manual que não bate com o que está descrito
- **Vazamento involuntário de informação confidencial** — captura de tela com PII, chave privada, token, ou dado de cliente real (improvável dado o escopo do material, mas reporta mesmo assim)

## O que reportar via issue pública

- **Typos**, erros gramaticais, inconsistências menores
- **Sugestões de melhoria** (clareza, exemplos, capítulos a adicionar)
- **Quebras de build** do PDF (puppeteer, marked, layout)

## O que esperar (correções factuais críticas)

| Etapa | SLA alvo |
|---|---|
| Confirmação de recebimento | até 3 dias úteis |
| Avaliação contra manuais oficiais BCB/Susep | até 7 dias úteis |
| Patch + nova release do PDF | conforme severidade do erro |

## Disclaimer geral

Este material é **introdutório e educacional**. Os números específicos (TTLs, limites, multas, SLAs) **mudam entre versões** dos manuais oficiais. O material destaca esses pontos com callouts. **Sempre valide o número exato contra**:

- **Manual do DICT (BCB)** — bcb.gov.br/estabilidadefinanceira/pix
- **Manual de Operações OFB** — openbankingbrasil.org.br
- **Padrões Open Insurance** — opinbrasil.com.br
- **Resoluções BCB / Circulares Susep** vigentes

O material explica **conceitos** e **arquitetura** que persistem entre versões — não os números efêmeros.

## Reconhecimentos

Lista de pessoas que reportaram correções relevantes será mantida em `CORRIGIDO-POR.md` (vazio enquanto não houver primeiro caso).
