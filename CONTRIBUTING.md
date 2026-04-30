# Contribuindo

Obrigado pelo interesse! Este repositório é um **material didático público sobre regulatório financeiro brasileiro** — contribuições que melhorem clareza, correção factual ou cobertura de tópicos relevantes pro nicho são muito bem-vindas.

## Como começar

1. Faça fork e crie uma branch a partir de `main`:
   ```bash
   git checkout -b fix/correcao-na-parte-3
   # ou
   git checkout -b feat/secao-pix-cripto
   ```
2. Edite os markdowns (`01-parte-1-fundamentos.md` a `05-parte-5-opin-compliance.md`)
3. Build local pra revisar o PDF:
   ```bash
   npm install
   node build.js
   ```
4. Verifique o output em `regulatorio-bcb-fundamentos-public.pdf`
5. Abra PR descrevendo a mudança e citando a fonte oficial (manual, resolução, circular)

## Tipos de contribuição

### Correções factuais (alta prioridade)

Use [Security Advisory privado](./SECURITY.md) se a correção altera **decisão arquitetural** que alguém poderia tomar lendo a versão errada (ex.: TTL incorreto, fluxo invertido, papel de ator trocado).

Use **PR público** pra correções menores que não afetam decisão arquitetural (typos, datas, gramática, formatação).

### Adições de conteúdo

Antes de abrir PR adicionando seção/capítulo novo, abra issue propondo o escopo. Mantemos o material focado nos 5 sistemas regulados centrais (SFN, Pix, DICT, Open Finance, Open Insurance) — desvios precisam de discussão prévia.

### Melhorias didáticas

Reformulação de seções pra clareza, novos diagramas em Mermaid, exemplos de código mais ilustrativos, callouts adicionais — bem-vindos.

## Convenções

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/) com prefixos adaptados ao contexto educacional:

```
<tipo>(<parte>): <descrição curta no imperativo>
```

Tipos aceitos:

- `fix` — correção factual
- `docs` — melhoria de clareza, gramática, formatação
- `feat` — adição de seção/capítulo/diagrama novo
- `style` — só CSS/layout do PDF
- `chore` — build script, dependências, gitignore
- `refactor` — reorganização sem mudança de conteúdo

Escopos: `parte-1`, `parte-2`, `parte-3`, `parte-4`, `parte-5`, `build`, `style`, `geral`.

Exemplos:

```
fix(parte-3): corrige TTL de cache DICT pra PJ (60s, era 90s no texto)
docs(parte-2): adiciona callout sobre MED não cobrir Pix Automático
feat(parte-5): nova seção sobre FAPI-CIBA flow no OPIN
chore(build): bumpa marked v14 pra v15
```

### Estilo de markdown

- Use `##` pra seções principais e `###` pra subseções (já partimos de `#` no título do capítulo)
- Tabelas pra dados estruturados (TTLs, fases, papéis); listas pra enumerações soltas
- Callouts com blockquote (`>`) — seguir padrão existente
- Referências a regulamentação oficial com link explícito (BCB, Susep, OFB)
- Termos técnicos em **negrito** na primeira ocorrência da seção
- Code spans com `` `backtick` `` pra nomes de endpoints, headers, claims

### Estilo de prosa

- Português Brasil, registro técnico-acessível
- Sem assumir conhecimento prévio de finanças (o público é eng. fintech *começando*)
- Explicar primeiro o **porquê** (motivação regulatória), depois o **como** (mecânica técnica)
- Comparações com analogias do dia-a-dia ajudam (ex.: "Pix por NFC é o aproximador do crédito, mas via Pix")
- Frases curtas. Parágrafos curtos. Páginas curtas.

### Diagramas

Mermaid no markdown — vai ser convertido pelo build:

```markdown
\```mermaid
sequenceDiagram
    Cliente->>Detentora: GET /accounts
    ...
\```
```

Evite diagramas com mais de 8-10 nós — quebram em A4. Divida em sub-diagramas se necessário.

## Fluxo de PR

1. PR descreve a mudança e cita a fonte oficial (link pro manual/resolução/circular relevante)
2. Build local do PDF roda sem erros (`node build.js`)
3. Diff visual no PDF revisado pelo autor antes de abrir o PR (PDFs grandes podem ter quebras inesperadas)
4. Squash merge é o padrão

## Reportando problemas factuais críticos

**Não abra issue pública** se a correção altera decisão arquitetural. Veja [SECURITY.md](./SECURITY.md).

## Licença

Ao contribuir, você concorda em licenciar suas mudanças sob a [MIT License](./LICENSE).
