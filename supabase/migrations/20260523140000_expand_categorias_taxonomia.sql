-- Expande taxonomia de categorias: corrige mapeamentos ML e nomes legados no banco.
-- Coluna promocoes.categoria é text livre (sem CHECK constraint).

UPDATE promocoes SET categoria = 'Pets'
WHERE categoria IN ('Pet Shop');

UPDATE promocoes SET categoria = 'Papelaria'
WHERE categoria IN ('Arte, Papelaria e Armarinho');

UPDATE promocoes SET categoria = 'Bebês'
WHERE categoria = 'Bebês';

UPDATE promocoes SET categoria = 'Ferramentas'
WHERE categoria = 'Ferramentas';

-- Saúde já é nome válido; corrige se algum registro ainda usa nome ML genérico
UPDATE promocoes SET categoria = 'Saúde'
WHERE categoria IN ('Saúde e Bem-Estar', 'Farmácia');
