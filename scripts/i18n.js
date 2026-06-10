/**
 * GLCTech — Sistema de Tradução Automática por Localidade
 * Detecta o idioma do navegador e traduz o site automaticamente.
 * Idiomas suportados: pt-BR (padrão), en, de, es, fr, it
 */

(function () {
  'use strict';

  /* ── DICIONÁRIOS ─────────────────────────────────────────────────────────── */

  var translations = {

    /* ── PORTUGUÊS (padrão) ─────────────────────────────────────────── */
    'pt': {
      /* Meta */
      'page.title': 'GLCTech — Monitoramento e Segurança em TI',
      'page.lang':  'pt-BR',

      /* Nav */
      'nav.about':    'Sobre',
      'nav.services': 'Serviços',
      'nav.team':     'Time',
      'nav.clients':  'Clientes',
      'nav.careers':  'Trabalhe Conosco',
      'nav.contact':  'Fale Conosco',

      /* Hero */
      'hero.badge':   'Monitoramento em tempo real · Zabbix & Grafana',
      'hero.live':    'Ao vivo',
      'hero.h1.line1':'Visibilidade Total',
      'hero.h1.line2':'da Sua',
      'hero.h1.line3':'de TI',
      'hero.h1.span': 'Infraestrutura',
      'hero.p':       'Detectamos falhas antes que impactem seu negócio. Monitoramento inteligente, segurança avançada e suporte especializado — tudo em um único parceiro.',
      'hero.cta1':    'Solicitar Diagnóstico',
      'hero.cta2':    'Ver Soluções',

      /* Stats */
      'stat.snmp':     'Devices monitorados via SNMP',
      'stat.capacity': 'Capacidade total de monitoramento',
      'stat.sla':      'SLA garantido aos clientes',
      'stat.support':  'Suporte técnico contínuo',

      /* About */
      'about.label':     'Sobre a GLCTech',
      'about.h2':        'Especialistas que garantem a continuidade do seu negócio',
      'about.p':         'A GLCTech nasceu com um propósito claro: transformar o monitoramento de TI em vantagem competitiva. Nossa abordagem combina tecnologia de ponta com profundo conhecimento técnico para garantir que sua infraestrutura opere no máximo desempenho — sempre.',
      'about.pillar1.h': 'Expertise em Zabbix',
      'about.pillar1.p': 'Equipe altamente qualificada em uma das plataformas líderes de monitoramento, com soluções personalizadas para cada cliente.',
      'about.pillar2.h': 'Suporte Abrangente',
      'about.pillar2.p': 'Da concepção à manutenção contínua, estamos ao seu lado em todas as etapas do projeto.',
      'about.pillar3.h': 'Inovação Tecnológica',
      'about.pillar3.p': 'Utilizamos Zabbix, Grafana e as melhores ferramentas do mercado para dashboards precisos e insights acionáveis.',
      'about.badge':     '+50 Projetos Entregues',

      /* Services */
      'services.label': 'Nossas Soluções',
      'services.h2':    'Tudo o que sua TI precisa,\nem um único parceiro',
      'services.p':     'Soluções integradas de monitoramento, segurança e backup para manter sua operação estável e protegida.',
      'services.s1.num':  '01 — Monitoramento',
      'services.s1.h':    'Monitoramento Inteligente com Zabbix',
      'services.s1.p':    'Acompanhe em tempo real servidores, redes e aplicações com métricas precisas, dashboards personalizados e análise proativa de incidentes.',
      'services.s1.link': 'Saiba mais',
      'services.s2.num':  '02 — Segurança',
      'services.s2.h':    'Segurança Kaspersky em Tempo Real',
      'services.s2.p':    'Monitore continuamente seus sistemas e detecte ameaças em tempo real, garantindo segurança, desempenho e conformidade em todo o ambiente.',
      'services.s2.link': 'Saiba mais',
      'services.s3.num':  '03 — Backup',
      'services.s3.h':    'Backup Inteligente com Veeam',
      'services.s3.p':    'Garanta a continuidade dos seus negócios com backups automáticos, recuperação rápida e relatórios completos sobre o status das suas cópias de segurança.',
      'services.s3.link': 'Saiba mais',

      /* Why Us */
      'why.label': 'Por que a GLCTech',
      'why.h2':    'Monitoramento que vai além dos alertas',
      'why.p':     'Escolher a GLCTech é optar por uma parceira que entende que monitoramento é sobre garantir a continuidade, segurança e eficiência do negócio.',
      'why.p1.h':  'Especialização Comprovada',
      'why.p1.p':  'Com ampla experiência em Zabbix, dominamos todo o ciclo de implantação — da arquitetura à automação, com as melhores práticas do mercado.',
      'why.p2.h':  'Abordagem Estratégica',
      'why.p2.p':  'Não entregamos apenas ferramentas: criamos estratégias sob medida, transformando dados em insights acionáveis para decisões mais rápidas.',
      'why.p3.h':  'Parceria de Longo Prazo',
      'why.p3.p':  'Suporte técnico contínuo, atualizações proativas e acompanhamento próximo — sua operação permanece estável e em constante evolução.',
      'why.p4.h':  'Compromisso com a Excelência',
      'why.p4.p':  'Qualidade, transparência e inovação em cada solução. Resultados mensuráveis e um ambiente de TI robusto e confiável.',
      'why.quote': '"A qualidade dos serviços prestados pela GLCTech é excepcional. Sempre atenciosos e ágeis, demonstram profundo conhecimento em sua área, oferecendo soluções eficazes para qualquer desafio."',
      'why.quote.role': 'Presidente — Web+ Telecom',

      /* Team */
      'team.label':   'Nosso Time',
      'team.h2':      'Liderança e especialistas que impulsionam a GLCTech',
      'team.m1.role': 'CEO & Fundador',
      'team.m1.bio':  'Fundador da GLCTech e especialista Zabbix, com ampla experiência em infraestrutura e monitoramento de TI. Lidera a visão estratégica da empresa unindo gestão executiva e profundo conhecimento técnico para entregar soluções de alto impacto aos clientes.',
      'team.m2.role': 'Co-Founder & Dev Operations',
      'team.m2.bio':  'Co-fundador da GLCTech, baseado em Manchester, Inglaterra. Responsável pelas operações de desenvolvimento e pela gestão de clientes internacionais. Sua presença no Reino Unido amplia o alcance da GLCTech para o mercado europeu, garantindo suporte e atendimento além das fronteiras brasileiras.',

      /* Testimonials */
      'testi.label': 'Depoimentos',
      'testi.h2':    'O que nossos clientes dizem',
      'testi.t1':    '"Sempre que precisamos de algo, eles estão dispostos a ajudar. Possuem excelente conhecimento de sua área e entregam soluções de acordo com as nossas necessidades. Recomendo fortemente."',
      'testi.t1.role': 'Presidente — Nordenet',
      'testi.t2':    '"A qualidade dos serviços prestados pela GLCTech é excepcional. Sempre atenciosos e ágeis, demonstram profundo conhecimento e oferecem soluções eficazes para qualquer desafio."',
      'testi.t2.role': 'Presidente — Web+ Telecom',

      /* Partners */
      'partners.label': 'Tecnologias & Parceiros de Confiança',

      /* CTA Banner */
      'cta.h2':  'Pronto para proteger sua infraestrutura?',
      'cta.p':   'Fale com nossos especialistas e descubra como a GLCTech pode transformar o monitoramento da sua empresa.',
      'cta.btn': 'Iniciar Diagnóstico Gratuito',

      /* Contact */
      'contact.label':    'Fale Conosco',
      'contact.h2':       'Entre em contato com nossa equipe técnica',
      'contact.p':        'Entre em contato com nossa equipe e descubra como a GLCTech pode otimizar sua infraestrutura de TI. Resposta em até 24h úteis.',
      'contact.email.label': 'E-mail',
      'contact.phone.label': 'Telefone / WhatsApp',
      'contact.location.label': 'Localização',
      'contact.location.val':   'São Paulo, SP — Brasil',
      'form.nome':      'Nome *',
      'form.nome.ph':   'Seu nome',
      'form.empresa':   'Empresa',
      'form.empresa.ph':'Nome da empresa',
      'form.email':     'E-mail *',
      'form.email.ph':  'seu@email.com.br',
      'form.tel':       'Telefone',
      'form.tel.ph':    '(11) 99999-9999',
      'form.msg':       'Mensagem *',
      'form.msg.ph':    'Descreva sua necessidade ou infraestrutura...',
      'form.submit':    'Enviar Mensagem',
      'form.sending':   'Enviando...',
      'form.success.h': 'Mensagem enviada!',
      'form.success.p': 'Recebemos seu contato e responderemos em até 24h úteis.',
      'form.success.btn':'Enviar nova mensagem',
      'form.err.nome':  'Por favor, informe seu nome.',
      'form.err.email': 'Informe um e-mail válido.',
      'form.err.msg':   'Por favor, escreva uma mensagem.',
      'form.err.send':  'Erro ao enviar. Tente novamente ou ligue: +55 11 95762-4146',

      /* Footer */
      'footer.p':           'Monitoramento inteligente e segurança de TI para empresas que exigem alta performance e continuidade operacional.',
      'footer.nav.title':   'Navegação',
      'footer.nav.about':   'Sobre',
      'footer.nav.services':'Serviços',
      'footer.nav.team':    'Time',
      'footer.nav.clients': 'Clientes',
      'footer.nav.blog':    'Blog',
      'footer.svc.title':   'Serviços',
      'footer.legal.title': 'Legal',
      'footer.legal.privacy': 'Política de Privacidade',
      'footer.legal.terms':   'Termos de Uso',
      'footer.copy':        '© 2025 GLCTech Tecnologia. Todos os direitos reservados.',
      'footer.location':    'São Paulo, SP — Brasil',

      /* Lang switcher */
      'lang.label': 'Idioma',
    },

    /* ── INGLÊS ─────────────────────────────────────────────────────── */
    'en': {
      'page.title': 'GLCTech — IT Monitoring & Security',
      'page.lang':  'en',

      'nav.about':    'About',
      'nav.services': 'Services',
      'nav.team':     'Team',
      'nav.clients':  'Clients',
      'nav.careers':  'Careers',
      'nav.contact':  'Contact Us',

      'hero.badge':   'Real-time monitoring · Zabbix & Grafana',
      'hero.live':    'Live',
      'hero.h1.line1':'Total Visibility',
      'hero.h1.line2':'of Your',
      'hero.h1.line3':'IT',
      'hero.h1.span': 'Infrastructure',
      'hero.p':       'We detect failures before they impact your business. Intelligent monitoring, advanced security and specialized support — all in a single partner.',
      'hero.cta1':    'Request Diagnosis',
      'hero.cta2':    'See Solutions',

      'stat.snmp':     'Devices monitored via SNMP',
      'stat.capacity': 'Total monitoring capacity',
      'stat.sla':      'SLA guaranteed to clients',
      'stat.support':  'Continuous technical support',

      'about.label':     'About GLCTech',
      'about.h2':        'Experts ensuring business continuity',
      'about.p':         'GLCTech was born with a clear purpose: to transform IT monitoring into a competitive advantage. Our approach combines cutting-edge technology with deep technical knowledge to ensure your infrastructure operates at peak performance — always.',
      'about.pillar1.h': 'Zabbix Expertise',
      'about.pillar1.p': 'Highly skilled team on one of the leading monitoring platforms, with customized solutions for each client.',
      'about.pillar2.h': 'Comprehensive Support',
      'about.pillar2.p': 'From conception to ongoing maintenance, we are by your side at every stage of the project.',
      'about.pillar3.h': 'Technological Innovation',
      'about.pillar3.p': 'We use Zabbix, Grafana and the best market tools for accurate dashboards and actionable insights.',
      'about.badge':     '+50 Projects Delivered',

      'services.label': 'Our Solutions',
      'services.h2':    'Everything your IT needs,\nin a single partner',
      'services.p':     'Integrated monitoring, security and backup solutions to keep your operation stable and protected.',
      'services.s1.num':  '01 — Monitoring',
      'services.s1.h':    'Intelligent Monitoring with Zabbix',
      'services.s1.p':    'Monitor servers, networks and applications in real time with precise metrics, custom dashboards and proactive incident analysis.',
      'services.s1.link': 'Learn more',
      'services.s2.num':  '02 — Security',
      'services.s2.h':    'Real-Time Kaspersky Security',
      'services.s2.p':    'Continuously monitor your systems and detect threats in real time, ensuring security, performance and compliance across the entire environment.',
      'services.s2.link': 'Learn more',
      'services.s3.num':  '03 — Backup',
      'services.s3.h':    'Intelligent Backup with Veeam',
      'services.s3.p':    'Ensure business continuity with automated backups, fast recovery and comprehensive reports on your backup status.',
      'services.s3.link': 'Learn more',

      'why.label': 'Why GLCTech',
      'why.h2':    'Monitoring that goes beyond alerts',
      'why.p':     'Choosing GLCTech means choosing a partner that understands monitoring is about ensuring business continuity, security and efficiency.',
      'why.p1.h':  'Proven Expertise',
      'why.p1.p':  'With broad Zabbix experience, we master the entire deployment cycle — from architecture to automation, following best market practices.',
      'why.p2.h':  'Strategic Approach',
      'why.p2.p':  'We don\'t just deliver tools: we create tailored strategies, turning data into actionable insights for faster decisions.',
      'why.p3.h':  'Long-Term Partnership',
      'why.p3.p':  'Continuous technical support, proactive updates and close follow-up — your operation stays stable and constantly evolving.',
      'why.p4.h':  'Commitment to Excellence',
      'why.p4.p':  'Quality, transparency and innovation in every solution. Measurable results and a robust, reliable IT environment.',
      'why.quote': '"The quality of services provided by GLCTech is exceptional. Always attentive and agile, they demonstrate deep knowledge in their field, offering effective solutions to any challenge."',
      'why.quote.role': 'President — Web+ Telecom',

      'team.label':   'Our Team',
      'team.h2':      'Leadership and experts driving GLCTech',
      'team.m1.role': 'CEO & Founder',
      'team.m1.bio':  'Founder of GLCTech and Zabbix specialist, with extensive experience in IT infrastructure and monitoring. Leads the company\'s strategic vision combining executive management and deep technical knowledge to deliver high-impact solutions.',
      'team.m2.role': 'Co-Founder & Dev Operations',
      'team.m2.bio':  'Co-founder of GLCTech, based in Manchester, England. Responsible for development operations and international client management. His presence in the UK expands GLCTech\'s reach to the European market, ensuring support beyond Brazilian borders.',

      'testi.label': 'Testimonials',
      'testi.h2':    'What our clients say',
      'testi.t1':    '"Whenever we need anything, they are ready to help. They have excellent knowledge in their field and deliver solutions tailored to our needs. Highly recommended."',
      'testi.t1.role': 'President — Nordenet',
      'testi.t2':    '"The quality of GLCTech\'s services is exceptional. Always attentive and agile, they demonstrate deep knowledge and offer effective solutions for any challenge."',
      'testi.t2.role': 'President — Web+ Telecom',

      'partners.label': 'Technologies & Trusted Partners',

      'cta.h2':  'Ready to protect your infrastructure?',
      'cta.p':   'Talk to our specialists and discover how GLCTech can transform your company\'s monitoring.',
      'cta.btn': 'Start Free Diagnosis',

      'contact.label':    'Contact Us',
      'contact.h2':       'Get in touch with our technical team',
      'contact.p':        'Contact our team and find out how GLCTech can optimize your IT infrastructure. Response within 24 business hours.',
      'contact.email.label': 'E-mail',
      'contact.phone.label': 'Phone / WhatsApp',
      'contact.location.label': 'Location',
      'contact.location.val':   'São Paulo, SP — Brazil',
      'form.nome':      'Name *',
      'form.nome.ph':   'Your name',
      'form.empresa':   'Company',
      'form.empresa.ph':'Company name',
      'form.email':     'E-mail *',
      'form.email.ph':  'you@email.com',
      'form.tel':       'Phone',
      'form.tel.ph':    '+1 (555) 000-0000',
      'form.msg':       'Message *',
      'form.msg.ph':    'Describe your need or infrastructure...',
      'form.submit':    'Send Message',
      'form.sending':   'Sending...',
      'form.success.h': 'Message sent!',
      'form.success.p': 'We received your message and will respond within 24 business hours.',
      'form.success.btn':'Send another message',
      'form.err.nome':  'Please enter your name.',
      'form.err.email': 'Please enter a valid e-mail.',
      'form.err.msg':   'Please write a message.',
      'form.err.send':  'Error sending. Please try again or call: +55 11 95762-4146',

      'footer.p':           'Intelligent IT monitoring and security for companies that demand high performance and operational continuity.',
      'footer.nav.title':   'Navigation',
      'footer.nav.about':   'About',
      'footer.nav.services':'Services',
      'footer.nav.team':    'Team',
      'footer.nav.clients': 'Clients',
      'footer.nav.blog':    'Blog',
      'footer.svc.title':   'Services',
      'footer.legal.title': 'Legal',
      'footer.legal.privacy': 'Privacy Policy',
      'footer.legal.terms':   'Terms of Use',
      'footer.copy':        '© 2025 GLCTech Tecnologia. All rights reserved.',
      'footer.location':    'São Paulo, SP — Brazil',
      'lang.label': 'Language',
    },

    /* ── ALEMÃO ──────────────────────────────────────────────────────── */
    'de': {
      'page.title': 'GLCTech — IT-Monitoring & Sicherheit',
      'page.lang':  'de',

      'nav.about':    'Über uns',
      'nav.services': 'Leistungen',
      'nav.team':     'Team',
      'nav.clients':  'Kunden',
      'nav.careers':  'Karriere',
      'nav.contact':  'Kontakt',

      'hero.badge':   'Echtzeit-Monitoring · Zabbix & Grafana',
      'hero.live':    'Live',
      'hero.h1.line1':'Vollständige Sichtbarkeit',
      'hero.h1.line2':'Ihrer',
      'hero.h1.line3':'IT',
      'hero.h1.span': 'Infrastruktur',
      'hero.p':       'Wir erkennen Ausfälle, bevor sie Ihr Geschäft beeinträchtigen. Intelligentes Monitoring, fortschrittliche Sicherheit und spezialisierter Support — alles bei einem einzigen Partner.',
      'hero.cta1':    'Diagnose anfragen',
      'hero.cta2':    'Lösungen ansehen',

      'stat.snmp':     'Geräte per SNMP überwacht',
      'stat.capacity': 'Gesamte Monitoring-Kapazität',
      'stat.sla':      'Garantierter SLA für Kunden',
      'stat.support':  'Kontinuierlicher technischer Support',

      'about.label':     'Über GLCTech',
      'about.h2':        'Experten, die die Kontinuität Ihres Unternehmens sichern',
      'about.p':         'GLCTech wurde mit einem klaren Ziel gegründet: IT-Monitoring in einen Wettbewerbsvorteil zu verwandeln. Unser Ansatz verbindet Spitzentechnologie mit tiefem technischem Know-how, um sicherzustellen, dass Ihre Infrastruktur stets auf Höchstleistung läuft.',
      'about.pillar1.h': 'Zabbix-Expertise',
      'about.pillar1.p': 'Hochqualifiziertes Team auf einer der führenden Monitoring-Plattformen, mit maßgeschneiderten Lösungen für jeden Kunden.',
      'about.pillar2.h': 'Umfassender Support',
      'about.pillar2.p': 'Von der Konzeption bis zur laufenden Wartung stehen wir Ihnen in jeder Projektphase zur Seite.',
      'about.pillar3.h': 'Technologische Innovation',
      'about.pillar3.p': 'Wir nutzen Zabbix, Grafana und die besten Markt-Tools für präzise Dashboards und umsetzbare Erkenntnisse.',
      'about.badge':     '+50 abgeschlossene Projekte',

      'services.label': 'Unsere Lösungen',
      'services.h2':    'Alles, was Ihre IT braucht,\nbei einem Partner',
      'services.p':     'Integrierte Monitoring-, Sicherheits- und Backup-Lösungen für eine stabile und geschützte Betriebsumgebung.',
      'services.s1.num':  '01 — Monitoring',
      'services.s1.h':    'Intelligentes Monitoring mit Zabbix',
      'services.s1.p':    'Überwachen Sie Server, Netzwerke und Anwendungen in Echtzeit mit präzisen Metriken, individuellen Dashboards und proaktiver Vorfallsanalyse.',
      'services.s1.link': 'Mehr erfahren',
      'services.s2.num':  '02 — Sicherheit',
      'services.s2.h':    'Kaspersky-Sicherheit in Echtzeit',
      'services.s2.p':    'Überwachen Sie Ihre Systeme kontinuierlich und erkennen Sie Bedrohungen in Echtzeit — für Sicherheit, Leistung und Compliance.',
      'services.s2.link': 'Mehr erfahren',
      'services.s3.num':  '03 — Backup',
      'services.s3.h':    'Intelligentes Backup mit Veeam',
      'services.s3.p':    'Sichern Sie die Geschäftskontinuität mit automatisierten Backups, schneller Wiederherstellung und vollständigen Statusberichten.',
      'services.s3.link': 'Mehr erfahren',

      'why.label': 'Warum GLCTech',
      'why.h2':    'Monitoring, das über Alarme hinausgeht',
      'why.p':     'GLCTech zu wählen bedeutet, sich für einen Partner zu entscheiden, der versteht, dass Monitoring die Sicherstellung von Kontinuität, Sicherheit und Effizienz bedeutet.',
      'why.p1.h':  'Bewährte Expertise',
      'why.p1.p':  'Mit umfangreicher Zabbix-Erfahrung beherrschen wir den gesamten Implementierungszyklus — von der Architektur bis zur Automatisierung.',
      'why.p2.h':  'Strategischer Ansatz',
      'why.p2.p':  'Wir liefern nicht nur Werkzeuge: Wir entwickeln maßgeschneiderte Strategien, die Daten in umsetzbare Erkenntnisse verwandeln.',
      'why.p3.h':  'Langfristige Partnerschaft',
      'why.p3.p':  'Kontinuierlicher technischer Support, proaktive Updates und enge Begleitung — Ihr Betrieb bleibt stabil und entwickelt sich stetig.',
      'why.p4.h':  'Engagement für Exzellenz',
      'why.p4.p':  'Qualität, Transparenz und Innovation in jeder Lösung. Messbare Ergebnisse und eine robuste, zuverlässige IT-Umgebung.',
      'why.quote': '„Die Qualität der von GLCTech erbrachten Dienstleistungen ist außergewöhnlich. Stets aufmerksam und agil, zeigen sie tiefes Fachwissen und bieten effektive Lösungen für jede Herausforderung."',
      'why.quote.role': 'Präsident — Web+ Telecom',

      'team.label':   'Unser Team',
      'team.h2':      'Führungskräfte und Experten, die GLCTech antreiben',
      'team.m1.role': 'CEO & Gründer',
      'team.m1.bio':  'Gründer von GLCTech und Zabbix-Spezialist mit umfangreicher Erfahrung in IT-Infrastruktur und Monitoring. Er leitet die strategische Vision des Unternehmens und verbindet Managementkompetenz mit technischem Know-how.',
      'team.m2.role': 'Mitgründer & Dev Operations',
      'team.m2.bio':  'Mitgründer von GLCTech, ansässig in Manchester, England. Verantwortlich für Entwicklungsbetrieb und internationales Kundenmanagement. Seine Präsenz im Vereinigten Königreich erweitert GLCTechs Reichweite auf den europäischen Markt.',

      'testi.label': 'Referenzen',
      'testi.h2':    'Was unsere Kunden sagen',
      'testi.t1':    '„Wann immer wir etwas brauchen, sind sie bereit zu helfen. Sie verfügen über hervorragendes Fachwissen und liefern Lösungen entsprechend unserer Bedürfnisse. Sehr empfehlenswert."',
      'testi.t1.role': 'Präsident — Nordenet',
      'testi.t2':    '„Die Qualität der GLCTech-Dienstleistungen ist außergewöhnlich. Stets aufmerksam und agil, zeigen sie tiefes Wissen und bieten effektive Lösungen für jede Herausforderung."',
      'testi.t2.role': 'Präsident — Web+ Telecom',

      'partners.label': 'Technologien & vertrauenswürdige Partner',

      'cta.h2':  'Bereit, Ihre Infrastruktur zu schützen?',
      'cta.p':   'Sprechen Sie mit unseren Spezialisten und entdecken Sie, wie GLCTech das Monitoring Ihres Unternehmens transformieren kann.',
      'cta.btn': 'Kostenlose Diagnose starten',

      'contact.label':    'Kontakt',
      'contact.h2':       'Kontaktieren Sie unser technisches Team',
      'contact.p':        'Kontaktieren Sie uns und erfahren Sie, wie GLCTech Ihre IT-Infrastruktur optimieren kann. Antwort innerhalb von 24 Geschäftsstunden.',
      'contact.email.label': 'E-Mail',
      'contact.phone.label': 'Telefon / WhatsApp',
      'contact.location.label': 'Standort',
      'contact.location.val':   'São Paulo, SP — Brasilien',
      'form.nome':      'Name *',
      'form.nome.ph':   'Ihr Name',
      'form.empresa':   'Unternehmen',
      'form.empresa.ph':'Unternehmensname',
      'form.email':     'E-Mail *',
      'form.email.ph':  'sie@email.de',
      'form.tel':       'Telefon',
      'form.tel.ph':    '+49 (0) 000 0000000',
      'form.msg':       'Nachricht *',
      'form.msg.ph':    'Beschreiben Sie Ihren Bedarf oder Ihre Infrastruktur...',
      'form.submit':    'Nachricht senden',
      'form.sending':   'Wird gesendet...',
      'form.success.h': 'Nachricht gesendet!',
      'form.success.p': 'Wir haben Ihre Nachricht erhalten und antworten innerhalb von 24 Geschäftsstunden.',
      'form.success.btn':'Weitere Nachricht senden',
      'form.err.nome':  'Bitte geben Sie Ihren Namen ein.',
      'form.err.email': 'Bitte geben Sie eine gültige E-Mail ein.',
      'form.err.msg':   'Bitte schreiben Sie eine Nachricht.',
      'form.err.send':  'Fehler beim Senden. Bitte erneut versuchen oder anrufen: +55 11 95762-4146',

      'footer.p':           'Intelligentes IT-Monitoring und Sicherheit für Unternehmen, die Hochleistung und Betriebskontinuität fordern.',
      'footer.nav.title':   'Navigation',
      'footer.nav.about':   'Über uns',
      'footer.nav.services':'Leistungen',
      'footer.nav.team':    'Team',
      'footer.nav.clients': 'Kunden',
      'footer.nav.blog':    'Blog',
      'footer.svc.title':   'Leistungen',
      'footer.legal.title': 'Rechtliches',
      'footer.legal.privacy': 'Datenschutzrichtlinie',
      'footer.legal.terms':   'Nutzungsbedingungen',
      'footer.copy':        '© 2025 GLCTech Tecnologia. Alle Rechte vorbehalten.',
      'footer.location':    'São Paulo, SP — Brasilien',
      'lang.label': 'Sprache',
    },

    /* ── ESPANHOL ────────────────────────────────────────────────────── */
    'es': {
      'page.title': 'GLCTech — Monitoreo y Seguridad en TI',
      'page.lang':  'es',

      'nav.about':    'Acerca de',
      'nav.services': 'Servicios',
      'nav.team':     'Equipo',
      'nav.clients':  'Clientes',
      'nav.careers':  'Trabaja con nosotros',
      'nav.contact':  'Contáctanos',

      'hero.badge':   'Monitoreo en tiempo real · Zabbix & Grafana',
      'hero.live':    'En vivo',
      'hero.h1.line1':'Visibilidad Total',
      'hero.h1.line2':'de tu',
      'hero.h1.line3':'TI',
      'hero.h1.span': 'Infraestructura',
      'hero.p':       'Detectamos fallas antes de que afecten tu negocio. Monitoreo inteligente, seguridad avanzada y soporte especializado — todo en un único socio.',
      'hero.cta1':    'Solicitar Diagnóstico',
      'hero.cta2':    'Ver Soluciones',

      'stat.snmp':     'Dispositivos monitoreados vía SNMP',
      'stat.capacity': 'Capacidad total de monitoreo',
      'stat.sla':      'SLA garantizado a los clientes',
      'stat.support':  'Soporte técnico continuo',

      'about.label':     'Acerca de GLCTech',
      'about.h2':        'Expertos que garantizan la continuidad de tu negocio',
      'about.p':         'GLCTech nació con un propósito claro: transformar el monitoreo de TI en ventaja competitiva. Nuestro enfoque combina tecnología de punta con profundo conocimiento técnico para garantizar que tu infraestructura opere al máximo rendimiento — siempre.',
      'about.pillar1.h': 'Expertise en Zabbix',
      'about.pillar1.p': 'Equipo altamente calificado en una de las plataformas líderes de monitoreo, con soluciones personalizadas para cada cliente.',
      'about.pillar2.h': 'Soporte Integral',
      'about.pillar2.p': 'Desde la concepción hasta el mantenimiento continuo, estamos a tu lado en cada etapa del proyecto.',
      'about.pillar3.h': 'Innovación Tecnológica',
      'about.pillar3.p': 'Utilizamos Zabbix, Grafana y las mejores herramientas del mercado para dashboards precisos e insights accionables.',
      'about.badge':     '+50 Proyectos Entregados',

      'services.label': 'Nuestras Soluciones',
      'services.h2':    'Todo lo que tu TI necesita,\nen un único socio',
      'services.p':     'Soluciones integradas de monitoreo, seguridad y backup para mantener tu operación estable y protegida.',
      'services.s1.num':  '01 — Monitoreo',
      'services.s1.h':    'Monitoreo Inteligente con Zabbix',
      'services.s1.p':    'Sigue en tiempo real servidores, redes y aplicaciones con métricas precisas, dashboards personalizados y análisis proactivo de incidentes.',
      'services.s1.link': 'Saber más',
      'services.s2.num':  '02 — Seguridad',
      'services.s2.h':    'Seguridad Kaspersky en Tiempo Real',
      'services.s2.p':    'Monitorea continuamente tus sistemas y detecta amenazas en tiempo real, garantizando seguridad, rendimiento y cumplimiento en todo el entorno.',
      'services.s2.link': 'Saber más',
      'services.s3.num':  '03 — Backup',
      'services.s3.h':    'Backup Inteligente con Veeam',
      'services.s3.p':    'Garantiza la continuidad de tu negocio con backups automáticos, recuperación rápida e informes completos sobre el estado de tus copias de seguridad.',
      'services.s3.link': 'Saber más',

      'why.label': 'Por qué GLCTech',
      'why.h2':    'Monitoreo que va más allá de las alertas',
      'why.p':     'Elegir GLCTech es optar por un socio que entiende que el monitoreo consiste en garantizar la continuidad, seguridad y eficiencia del negocio.',
      'why.p1.h':  'Especialización Comprobada',
      'why.p1.p':  'Con amplia experiencia en Zabbix, dominamos todo el ciclo de implementación — de la arquitectura a la automatización, con las mejores prácticas del mercado.',
      'why.p2.h':  'Enfoque Estratégico',
      'why.p2.p':  'No solo entregamos herramientas: creamos estrategias a medida, transformando datos en insights accionables para decisiones más rápidas.',
      'why.p3.h':  'Alianza a Largo Plazo',
      'why.p3.p':  'Soporte técnico continuo, actualizaciones proactivas y acompañamiento cercano — tu operación permanece estable y en constante evolución.',
      'why.p4.h':  'Compromiso con la Excelencia',
      'why.p4.p':  'Calidad, transparencia e innovación en cada solución. Resultados medibles y un entorno de TI robusto y confiable.',
      'why.quote': '"La calidad de los servicios prestados por GLCTech es excepcional. Siempre atentos y ágiles, demuestran profundo conocimiento y ofrecen soluciones eficaces para cualquier desafío."',
      'why.quote.role': 'Presidente — Web+ Telecom',

      'team.label':   'Nuestro Equipo',
      'team.h2':      'Liderazgo y expertos que impulsan GLCTech',
      'team.m1.role': 'CEO y Fundador',
      'team.m1.bio':  'Fundador de GLCTech y especialista Zabbix, con amplia experiencia en infraestructura y monitoreo de TI. Lidera la visión estratégica de la empresa uniendo gestión ejecutiva y profundo conocimiento técnico.',
      'team.m2.role': 'Cofundador & Dev Operations',
      'team.m2.bio':  'Cofundador de GLCTech, con sede en Manchester, Inglaterra. Responsable de las operaciones de desarrollo y gestión de clientes internacionales. Su presencia en el Reino Unido amplía el alcance de GLCTech al mercado europeo.',

      'testi.label': 'Testimonios',
      'testi.h2':    'Lo que dicen nuestros clientes',
      'testi.t1':    '"Siempre que necesitamos algo, están dispuestos a ayudar. Poseen excelente conocimiento de su área y entregan soluciones acordes a nuestras necesidades. Muy recomendados."',
      'testi.t1.role': 'Presidente — Nordenet',
      'testi.t2':    '"La calidad de los servicios de GLCTech es excepcional. Siempre atentos y ágiles, demuestran profundo conocimiento y ofrecen soluciones eficaces para cualquier desafío."',
      'testi.t2.role': 'Presidente — Web+ Telecom',

      'partners.label': 'Tecnologías & Socios de Confianza',

      'cta.h2':  '¿Listo para proteger tu infraestructura?',
      'cta.p':   'Habla con nuestros especialistas y descubre cómo GLCTech puede transformar el monitoreo de tu empresa.',
      'cta.btn': 'Iniciar Diagnóstico Gratuito',

      'contact.label':    'Contáctanos',
      'contact.h2':       'Ponte en contacto con nuestro equipo técnico',
      'contact.p':        'Contáctanos y descubre cómo GLCTech puede optimizar tu infraestructura de TI. Respuesta en hasta 24 horas hábiles.',
      'contact.email.label': 'Correo electrónico',
      'contact.phone.label': 'Teléfono / WhatsApp',
      'contact.location.label': 'Ubicación',
      'contact.location.val':   'São Paulo, SP — Brasil',
      'form.nome':      'Nombre *',
      'form.nome.ph':   'Tu nombre',
      'form.empresa':   'Empresa',
      'form.empresa.ph':'Nombre de la empresa',
      'form.email':     'Correo electrónico *',
      'form.email.ph':  'tu@correo.com',
      'form.tel':       'Teléfono',
      'form.tel.ph':    '+54 9 11 0000-0000',
      'form.msg':       'Mensaje *',
      'form.msg.ph':    'Describe tu necesidad o infraestructura...',
      'form.submit':    'Enviar Mensaje',
      'form.sending':   'Enviando...',
      'form.success.h': '¡Mensaje enviado!',
      'form.success.p': 'Recibimos tu mensaje y responderemos en hasta 24 horas hábiles.',
      'form.success.btn':'Enviar otro mensaje',
      'form.err.nome':  'Por favor ingresa tu nombre.',
      'form.err.email': 'Ingresa un correo electrónico válido.',
      'form.err.msg':   'Por favor escribe un mensaje.',
      'form.err.send':  'Error al enviar. Inténtalo de nuevo o llama: +55 11 95762-4146',

      'footer.p':           'Monitoreo inteligente y seguridad de TI para empresas que exigen alto rendimiento y continuidad operacional.',
      'footer.nav.title':   'Navegación',
      'footer.nav.about':   'Acerca de',
      'footer.nav.services':'Servicios',
      'footer.nav.team':    'Equipo',
      'footer.nav.clients': 'Clientes',
      'footer.nav.blog':    'Blog',
      'footer.svc.title':   'Servicios',
      'footer.legal.title': 'Legal',
      'footer.legal.privacy': 'Política de Privacidad',
      'footer.legal.terms':   'Términos de Uso',
      'footer.copy':        '© 2025 GLCTech Tecnologia. Todos los derechos reservados.',
      'footer.location':    'São Paulo, SP — Brasil',
      'lang.label': 'Idioma',
    },

    /* ── FRANCÊS ─────────────────────────────────────────────────────── */
    'fr': {
      'page.title': 'GLCTech — Supervision & Sécurité IT',
      'page.lang':  'fr',

      'nav.about':    'À propos',
      'nav.services': 'Services',
      'nav.team':     'Équipe',
      'nav.clients':  'Clients',
      'nav.careers':  'Rejoindre l\'équipe',
      'nav.contact':  'Nous contacter',

      'hero.badge':   'Supervision en temps réel · Zabbix & Grafana',
      'hero.live':    'En direct',
      'hero.h1.line1':'Visibilité Totale',
      'hero.h1.line2':'de Votre',
      'hero.h1.line3':'IT',
      'hero.h1.span': 'Infrastructure',
      'hero.p':       'Nous détectons les pannes avant qu\'elles n\'impactent votre activité. Supervision intelligente, sécurité avancée et support spécialisé — en un seul partenaire.',
      'hero.cta1':    'Demander un diagnostic',
      'hero.cta2':    'Voir les solutions',

      'stat.snmp':     'Équipements supervisés via SNMP',
      'stat.capacity': 'Capacité totale de supervision',
      'stat.sla':      'SLA garanti aux clients',
      'stat.support':  'Support technique continu',

      'about.label':     'À propos de GLCTech',
      'about.h2':        'Des experts qui garantissent la continuité de votre activité',
      'about.p':         'GLCTech est né avec un objectif clair : transformer la supervision IT en avantage concurrentiel. Notre approche combine technologie de pointe et expertise technique approfondie pour garantir la performance maximale de votre infrastructure.',
      'about.pillar1.h': 'Expertise Zabbix',
      'about.pillar1.p': 'Équipe hautement qualifiée sur l\'une des plateformes de supervision leaders, avec des solutions personnalisées pour chaque client.',
      'about.pillar2.h': 'Support Complet',
      'about.pillar2.p': 'De la conception à la maintenance continue, nous sommes à vos côtés à chaque étape du projet.',
      'about.pillar3.h': 'Innovation Technologique',
      'about.pillar3.p': 'Nous utilisons Zabbix, Grafana et les meilleurs outils du marché pour des tableaux de bord précis et des insights actionnables.',
      'about.badge':     '+50 Projets livrés',

      'services.label': 'Nos Solutions',
      'services.h2':    'Tout ce dont votre IT a besoin,\nchez un seul partenaire',
      'services.p':     'Solutions intégrées de supervision, sécurité et sauvegarde pour maintenir votre activité stable et protégée.',
      'services.s1.num':  '01 — Supervision',
      'services.s1.h':    'Supervision Intelligente avec Zabbix',
      'services.s1.p':    'Surveillez en temps réel serveurs, réseaux et applications avec des métriques précises, des tableaux de bord personnalisés et une analyse proactive des incidents.',
      'services.s1.link': 'En savoir plus',
      'services.s2.num':  '02 — Sécurité',
      'services.s2.h':    'Sécurité Kaspersky en Temps Réel',
      'services.s2.p':    'Surveillez en continu vos systèmes et détectez les menaces en temps réel, garantissant sécurité, performance et conformité dans tout l\'environnement.',
      'services.s2.link': 'En savoir plus',
      'services.s3.num':  '03 — Sauvegarde',
      'services.s3.h':    'Sauvegarde Intelligente avec Veeam',
      'services.s3.p':    'Assurez la continuité de votre activité avec des sauvegardes automatiques, une récupération rapide et des rapports complets sur l\'état de vos copies.',
      'services.s3.link': 'En savoir plus',

      'why.label': 'Pourquoi GLCTech',
      'why.h2':    'Une supervision qui va au-delà des alertes',
      'why.p':     'Choisir GLCTech, c\'est opter pour un partenaire qui comprend que la supervision est avant tout une garantie de continuité, sécurité et efficacité.',
      'why.p1.h':  'Expertise Reconnue',
      'why.p1.p':  'Avec une vaste expérience Zabbix, nous maîtrisons l\'intégralité du cycle de déploiement — de l\'architecture à l\'automatisation.',
      'why.p2.h':  'Approche Stratégique',
      'why.p2.p':  'Nous ne livrons pas seulement des outils : nous créons des stratégies sur mesure, transformant les données en insights actionnables.',
      'why.p3.h':  'Partenariat Durable',
      'why.p3.p':  'Support technique continu, mises à jour proactives et suivi rapproché — votre exploitation reste stable et en constante évolution.',
      'why.p4.h':  'Engagement envers l\'Excellence',
      'why.p4.p':  'Qualité, transparence et innovation dans chaque solution. Résultats mesurables et environnement IT robuste et fiable.',
      'why.quote': '« La qualité des services fournis par GLCTech est exceptionnelle. Toujours attentifs et agiles, ils font preuve d\'une connaissance approfondie de leur domaine et proposent des solutions efficaces à chaque défi. »',
      'why.quote.role': 'Président — Web+ Telecom',

      'team.label':   'Notre Équipe',
      'team.h2':      'Leadership et experts qui propulsent GLCTech',
      'team.m1.role': 'PDG & Fondateur',
      'team.m1.bio':  'Fondateur de GLCTech et spécialiste Zabbix, avec une vaste expérience en infrastructure et supervision IT. Il dirige la vision stratégique de l\'entreprise en combinant management et expertise technique.',
      'team.m2.role': 'Cofondateur & Dev Operations',
      'team.m2.bio':  'Cofondateur de GLCTech, basé à Manchester, Angleterre. Responsable des opérations de développement et de la gestion des clients internationaux. Sa présence au Royaume-Uni étend la portée de GLCTech au marché européen.',

      'testi.label': 'Témoignages',
      'testi.h2':    'Ce que disent nos clients',
      'testi.t1':    '« Chaque fois que nous avons besoin de quelque chose, ils sont prêts à aider. Ils ont une excellente connaissance de leur domaine et livrent des solutions adaptées à nos besoins. Fortement recommandé. »',
      'testi.t1.role': 'Président — Nordenet',
      'testi.t2':    '« La qualité des services de GLCTech est exceptionnelle. Toujours attentifs et agiles, ils démontrent une connaissance approfondie et offrent des solutions efficaces à chaque défi. »',
      'testi.t2.role': 'Président — Web+ Telecom',

      'partners.label': 'Technologies & Partenaires de Confiance',

      'cta.h2':  'Prêt à protéger votre infrastructure ?',
      'cta.p':   'Parlez à nos spécialistes et découvrez comment GLCTech peut transformer la supervision de votre entreprise.',
      'cta.btn': 'Démarrer le diagnostic gratuit',

      'contact.label':    'Nous contacter',
      'contact.h2':       'Contactez notre équipe technique',
      'contact.p':        'Contactez-nous et découvrez comment GLCTech peut optimiser votre infrastructure IT. Réponse sous 24 heures ouvrées.',
      'contact.email.label': 'E-mail',
      'contact.phone.label': 'Téléphone / WhatsApp',
      'contact.location.label': 'Localisation',
      'contact.location.val':   'São Paulo, SP — Brésil',
      'form.nome':      'Nom *',
      'form.nome.ph':   'Votre nom',
      'form.empresa':   'Entreprise',
      'form.empresa.ph':'Nom de l\'entreprise',
      'form.email':     'E-mail *',
      'form.email.ph':  'vous@email.fr',
      'form.tel':       'Téléphone',
      'form.tel.ph':    '+33 (0)1 00 00 00 00',
      'form.msg':       'Message *',
      'form.msg.ph':    'Décrivez votre besoin ou votre infrastructure...',
      'form.submit':    'Envoyer le message',
      'form.sending':   'Envoi en cours...',
      'form.success.h': 'Message envoyé !',
      'form.success.p': 'Nous avons bien reçu votre message et répondrons sous 24 heures ouvrées.',
      'form.success.btn':'Envoyer un autre message',
      'form.err.nome':  'Veuillez saisir votre nom.',
      'form.err.email': 'Veuillez saisir un e-mail valide.',
      'form.err.msg':   'Veuillez écrire un message.',
      'form.err.send':  'Erreur d\'envoi. Veuillez réessayer ou appeler : +55 11 95762-4146',

      'footer.p':           'Supervision IT intelligente et sécurité pour les entreprises exigeant haute performance et continuité opérationnelle.',
      'footer.nav.title':   'Navigation',
      'footer.nav.about':   'À propos',
      'footer.nav.services':'Services',
      'footer.nav.team':    'Équipe',
      'footer.nav.clients': 'Clients',
      'footer.nav.blog':    'Blog',
      'footer.svc.title':   'Services',
      'footer.legal.title': 'Légal',
      'footer.legal.privacy': 'Politique de confidentialité',
      'footer.legal.terms':   'Conditions d\'utilisation',
      'footer.copy':        '© 2025 GLCTech Tecnologia. Tous droits réservés.',
      'footer.location':    'São Paulo, SP — Brésil',
      'lang.label': 'Langue',
    },

    /* ── ITALIANO ────────────────────────────────────────────────────── */
    'it': {
      'page.title': 'GLCTech — Monitoraggio e Sicurezza IT',
      'page.lang':  'it',

      'nav.about':    'Chi siamo',
      'nav.services': 'Servizi',
      'nav.team':     'Team',
      'nav.clients':  'Clienti',
      'nav.careers':  'Lavora con noi',
      'nav.contact':  'Contattaci',

      'hero.badge':   'Monitoraggio in tempo reale · Zabbix & Grafana',
      'hero.live':    'In diretta',
      'hero.h1.line1':'Visibilità Totale',
      'hero.h1.line2':'della Tua',
      'hero.h1.line3':'IT',
      'hero.h1.span': 'Infrastruttura',
      'hero.p':       'Rilevamo i guasti prima che impattino il tuo business. Monitoraggio intelligente, sicurezza avanzata e supporto specializzato — tutto da un unico partner.',
      'hero.cta1':    'Richiedere Diagnosi',
      'hero.cta2':    'Vedi Soluzioni',

      'stat.snmp':     'Dispositivi monitorati via SNMP',
      'stat.capacity': 'Capacità totale di monitoraggio',
      'stat.sla':      'SLA garantito ai clienti',
      'stat.support':  'Supporto tecnico continuo',

      'about.label':     'Chi è GLCTech',
      'about.h2':        'Esperti che garantiscono la continuità del tuo business',
      'about.p':         'GLCTech è nata con uno scopo chiaro: trasformare il monitoraggio IT in vantaggio competitivo. Il nostro approccio combina tecnologia all\'avanguardia con una profonda conoscenza tecnica per garantire le massime prestazioni della tua infrastruttura.',
      'about.pillar1.h': 'Competenza Zabbix',
      'about.pillar1.p': 'Team altamente qualificato su una delle piattaforme di monitoraggio leader, con soluzioni personalizzate per ogni cliente.',
      'about.pillar2.h': 'Supporto Completo',
      'about.pillar2.p': 'Dalla concezione alla manutenzione continua, siamo al tuo fianco in ogni fase del progetto.',
      'about.pillar3.h': 'Innovazione Tecnologica',
      'about.pillar3.p': 'Utilizziamo Zabbix, Grafana e i migliori strumenti di mercato per dashboard precisi e insight azionabili.',
      'about.badge':     '+50 Progetti Consegnati',

      'services.label': 'Le Nostre Soluzioni',
      'services.h2':    'Tutto ciò di cui la tua IT ha bisogno,\nin un unico partner',
      'services.p':     'Soluzioni integrate di monitoraggio, sicurezza e backup per mantenere la tua operazione stabile e protetta.',
      'services.s1.num':  '01 — Monitoraggio',
      'services.s1.h':    'Monitoraggio Intelligente con Zabbix',
      'services.s1.p':    'Monitora in tempo reale server, reti e applicazioni con metriche precise, dashboard personalizzati e analisi proattiva degli incidenti.',
      'services.s1.link': 'Scopri di più',
      'services.s2.num':  '02 — Sicurezza',
      'services.s2.h':    'Sicurezza Kaspersky in Tempo Reale',
      'services.s2.p':    'Monitora continuamente i tuoi sistemi e rileva le minacce in tempo reale, garantendo sicurezza, prestazioni e conformità in tutto l\'ambiente.',
      'services.s2.link': 'Scopri di più',
      'services.s3.num':  '03 — Backup',
      'services.s3.h':    'Backup Intelligente con Veeam',
      'services.s3.p':    'Garantisci la continuità del tuo business con backup automatici, ripristino rapido e report completi sullo stato delle copie di sicurezza.',
      'services.s3.link': 'Scopri di più',

      'why.label': 'Perché GLCTech',
      'why.h2':    'Monitoraggio che va oltre gli alert',
      'why.p':     'Scegliere GLCTech significa scegliere un partner che capisce che il monitoraggio riguarda la continuità, la sicurezza e l\'efficienza del business.',
      'why.p1.h':  'Specializzazione Comprovata',
      'why.p1.p':  'Con ampia esperienza in Zabbix, padroneggiamo l\'intero ciclo di implementazione — dall\'architettura all\'automazione.',
      'why.p2.h':  'Approccio Strategico',
      'why.p2.p':  'Non consegniamo solo strumenti: creiamo strategie su misura, trasformando i dati in insight azionabili per decisioni più rapide.',
      'why.p3.h':  'Partnership a Lungo Termine',
      'why.p3.p':  'Supporto tecnico continuo, aggiornamenti proattivi e monitoraggio ravvicinato — la tua operazione rimane stabile e in costante evoluzione.',
      'why.p4.h':  'Impegno per l\'Eccellenza',
      'why.p4.p':  'Qualità, trasparenza e innovazione in ogni soluzione. Risultati misurabili e un ambiente IT robusto e affidabile.',
      'why.quote': '«La qualità dei servizi forniti da GLCTech è eccezionale. Sempre attenti e agili, dimostrano una profonda conoscenza del loro campo, offrendo soluzioni efficaci a qualsiasi sfida.»',
      'why.quote.role': 'Presidente — Web+ Telecom',

      'team.label':   'Il Nostro Team',
      'team.h2':      'Leadership ed esperti che guidano GLCTech',
      'team.m1.role': 'CEO & Fondatore',
      'team.m1.bio':  'Fondatore di GLCTech e specialista Zabbix, con ampia esperienza in infrastruttura IT e monitoraggio. Guida la visione strategica dell\'azienda unendo gestione esecutiva e profonda competenza tecnica.',
      'team.m2.role': 'Cofondatore & Dev Operations',
      'team.m2.bio':  'Cofondatore di GLCTech, con sede a Manchester, Inghilterra. Responsabile delle operazioni di sviluppo e della gestione dei clienti internazionali. La sua presenza nel Regno Unito amplia la portata di GLCTech al mercato europeo.',

      'testi.label': 'Testimonianze',
      'testi.h2':    'Cosa dicono i nostri clienti',
      'testi.t1':    '«Ogni volta che abbiamo bisogno di qualcosa, sono pronti ad aiutare. Hanno un\'ottima conoscenza del loro campo e consegnano soluzioni adatte alle nostre esigenze. Fortemente raccomandato.»',
      'testi.t1.role': 'Presidente — Nordenet',
      'testi.t2':    '«La qualità dei servizi di GLCTech è eccezionale. Sempre attenti e agili, dimostrano conoscenza approfondita e offrono soluzioni efficaci per qualsiasi sfida.»',
      'testi.t2.role': 'Presidente — Web+ Telecom',

      'partners.label': 'Tecnologie & Partner di Fiducia',

      'cta.h2':  'Pronto a proteggere la tua infrastruttura?',
      'cta.p':   'Parla con i nostri specialisti e scopri come GLCTech può trasformare il monitoraggio della tua azienda.',
      'cta.btn': 'Inizia la Diagnosi Gratuita',

      'contact.label':    'Contattaci',
      'contact.h2':       'Mettiti in contatto con il nostro team tecnico',
      'contact.p':        'Contattaci e scopri come GLCTech può ottimizzare la tua infrastruttura IT. Risposta entro 24 ore lavorative.',
      'contact.email.label': 'E-mail',
      'contact.phone.label': 'Telefono / WhatsApp',
      'contact.location.label': 'Posizione',
      'contact.location.val':   'São Paulo, SP — Brasile',
      'form.nome':      'Nome *',
      'form.nome.ph':   'Il tuo nome',
      'form.empresa':   'Azienda',
      'form.empresa.ph':'Nome dell\'azienda',
      'form.email':     'E-mail *',
      'form.email.ph':  'tu@email.it',
      'form.tel':       'Telefono',
      'form.tel.ph':    '+39 00 0000 0000',
      'form.msg':       'Messaggio *',
      'form.msg.ph':    'Descrivi la tua esigenza o infrastruttura...',
      'form.submit':    'Invia Messaggio',
      'form.sending':   'Invio in corso...',
      'form.success.h': 'Messaggio inviato!',
      'form.success.p': 'Abbiamo ricevuto il tuo messaggio e risponderemo entro 24 ore lavorative.',
      'form.success.btn':'Invia un altro messaggio',
      'form.err.nome':  'Per favore inserisci il tuo nome.',
      'form.err.email': 'Inserisci un\'e-mail valida.',
      'form.err.msg':   'Per favore scrivi un messaggio.',
      'form.err.send':  'Errore di invio. Riprova o chiama: +55 11 95762-4146',

      'footer.p':           'Monitoraggio IT intelligente e sicurezza per aziende che richiedono alte prestazioni e continuità operativa.',
      'footer.nav.title':   'Navigazione',
      'footer.nav.about':   'Chi siamo',
      'footer.nav.services':'Servizi',
      'footer.nav.team':    'Team',
      'footer.nav.clients': 'Clienti',
      'footer.nav.blog':    'Blog',
      'footer.svc.title':   'Servizi',
      'footer.legal.title': 'Legale',
      'footer.legal.privacy': 'Informativa sulla Privacy',
      'footer.legal.terms':   'Termini di Utilizzo',
      'footer.copy':        '© 2025 GLCTech Tecnologia. Tutti i diritti riservati.',
      'footer.location':    'São Paulo, SP — Brasile',
      'lang.label': 'Lingua',
    }
  };

  /* ── MAPEAMENTO DE LOCALE → IDIOMA ───────────────────────────────────────── */

  var localeMap = {
    'pt': 'pt', 'pt-br': 'pt', 'pt-pt': 'pt',
    'en': 'en', 'en-us': 'en', 'en-gb': 'en', 'en-au': 'en', 'en-ca': 'en', 'en-nz': 'en',
    'de': 'de', 'de-de': 'de', 'de-at': 'de', 'de-ch': 'de',
    'es': 'es', 'es-es': 'es', 'es-mx': 'es', 'es-ar': 'es', 'es-co': 'es', 'es-cl': 'es', 'es-pe': 'es',
    'fr': 'fr', 'fr-fr': 'fr', 'fr-be': 'fr', 'fr-ch': 'fr', 'fr-ca': 'fr',
    'it': 'it', 'it-it': 'it', 'it-ch': 'it',
  };

  /* ── DETECTAR IDIOMA ─────────────────────────────────────────────────────── */

  function detectLang() {
    // 1. Preferência salva pelo usuário
    var saved = localStorage.getItem('glctech_lang');
    if (saved && translations[saved]) return saved;

    // 2. navigator.languages (lista de preferências do navegador)
    var langs = navigator.languages || [navigator.language || navigator.userLanguage || 'pt'];
    for (var i = 0; i < langs.length; i++) {
      var loc = (langs[i] || '').toLowerCase();
      if (localeMap[loc])        return localeMap[loc];
      var base = loc.split('-')[0];
      if (localeMap[base])       return localeMap[base];
    }
    return 'pt'; // padrão
  }

  /* ── APLICAR TRADUÇÃO ────────────────────────────────────────────────────── */

  function t(key, lang) {
    var dict = translations[lang] || translations['pt'];
    return dict[key] !== undefined ? dict[key] : (translations['pt'][key] || key);
  }

  function applyLang(lang) {
    var dict = translations[lang] || translations['pt'];

    // Atualiza <html lang="...">
    document.documentElement.lang = dict['page.lang'] || lang;
    document.title = dict['page.title'] || document.title;

    // Traduz todos os elementos com data-i18n
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el  = els[i];
      var key = el.getAttribute('data-i18n');
      var val = t(key, lang);

      if (el.hasAttribute('data-i18n-attr')) {
        // Traduzir atributo (placeholder, aria-label, etc.)
        var attr = el.getAttribute('data-i18n-attr');
        el.setAttribute(attr, val);
      } else if (el.hasAttribute('data-i18n-html')) {
        // Traduzir innerHTML
        el.innerHTML = val;
      } else {
        // Traduzir textContent (padrão)
        el.textContent = val;
      }
    }

    // Atualiza variáveis JS para validação do formulário
    window._i18n_errors = {
      nome:    t('form.err.nome',  lang),
      email:   t('form.err.email', lang),
      msg:     t('form.err.msg',   lang),
      send:    t('form.err.send',  lang),
    };

    // Atualizar seletor de idioma
    var sel = document.getElementById('lang-switcher');
    if (sel) sel.value = lang;

    // Salva preferência
    localStorage.setItem('glctech_lang', lang);
    window._currentLang = lang;
  }

  /* ── CRIAR SELETOR DE IDIOMA ─────────────────────────────────────────────── */

  function buildSwitcher() {
    var flags = { pt: '🇧🇷', en: '🇺🇸', de: '🇩🇪', es: '🇪🇸', fr: '🇫🇷', it: '🇮🇹' };
    var names  = { pt: 'PT', en: 'EN', de: 'DE', es: 'ES', fr: 'FR', it: 'IT' };

    var wrap = document.createElement('div');
    wrap.id = 'lang-switcher-wrap';
    wrap.style.cssText = 'display:flex;align-items:center;gap:4px;';

    var sel = document.createElement('select');
    sel.id = 'lang-switcher';
    sel.setAttribute('aria-label', 'Select language');
    sel.style.cssText = [
      'background:transparent',
      'border:1px solid var(--dark-border)',
      'color:var(--gray-dim)',
      'font-family:var(--font-display)',
      'font-size:12px',
      'font-weight:600',
      'letter-spacing:0.05em',
      'padding:5px 8px',
      'border-radius:var(--radius)',
      'cursor:pointer',
      'outline:none',
      'transition:border-color 0.22s ease,color 0.22s ease',
    ].join(';');

    Object.keys(names).forEach(function(code) {
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = flags[code] + ' ' + names[code];
      sel.appendChild(opt);
    });

    sel.addEventListener('change', function() {
      applyLang(this.value);
    });

    sel.addEventListener('mouseover', function() {
      this.style.borderColor = 'var(--red)';
      this.style.color = 'var(--white)';
    });
    sel.addEventListener('mouseout', function() {
      this.style.borderColor = 'var(--dark-border)';
      this.style.color = 'var(--gray-dim)';
    });

    wrap.appendChild(sel);
    return wrap;
  }

  /* ── INIT ────────────────────────────────────────────────────────────────── */

  function init() {
    // Injeta seletor na nav
    var navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      var li = document.createElement('li');
      li.appendChild(buildSwitcher());
      navLinks.appendChild(li);
    }

    var lang = detectLang();
    applyLang(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expor para uso externo
  window.glcI18n = { apply: applyLang, t: t };

})();
