-- Dados iniciais: quatro almas + configurações MBWay

insert into public.souls (code, age, country, extra_info, description, goal_cents, raised_cents, status)
values
  (
    '01',
    40,
    'Brasil',
    null,
    'Deseja participar novamente no Encontro com Deus Redenção para fortalecer a sua caminhada com Cristo.',
    11000,
    0,
    'disponivel'
  ),
  (
    '02',
    32,
    'Brasil',
    'Divorciada · Mãe de 3 filhos',
    'Deseja participar pela primeira vez no Encontro com Deus Redenção para entregar completamente a sua vida a Jesus.',
    11000,
    0,
    'disponivel'
  ),
  (
    '03',
    20,
    'Brasil',
    'Mãe de uma criança',
    'Tenho 20 anos, sou mãe de uma criança e desejo participar novamente no Encontro com Deus Redenção. Na minha primeira experiência fui profundamente impactada pelo amor de Deus e saí fortalecida espiritualmente. Quero viver mais uma vez este tempo de renovação, crescimento e comunhão com os irmãos, para continuar firme nos propósitos que Deus tem para a minha vida e para a minha família.',
    11000,
    0,
    'disponivel'
  ),
  (
    '04',
    null,
    'Brasil',
    'Mãe de uma criança',
    'Sou mãe de uma criança e desejo participar pela primeira vez no Encontro com Deus Redenção. Tenho buscado me aproximar mais de Deus e acredito que este encontro será uma oportunidade para transformar a minha vida, fortalecer a minha fé e construir um futuro melhor para mim e para o meu filho. O meu desejo é conhecer mais profundamente o amor e os planos de Deus para a nossa família.',
    11000,
    0,
    'disponivel'
  )
on conflict (code) do nothing;

insert into public.site_settings (key, value)
values
  ('mbway_number', '+351 965 012 201'),
  ('mbway_qr_url', '/mbway-qr.png')
on conflict (key) do update set value = excluded.value;
