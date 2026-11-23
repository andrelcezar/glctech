# GLCTech Sec UK pricing model (approved)

Status: Approved price book. Offer and monitoring prices are displayed on the site. All figures GBP, ex VAT.
Replaces the old Brazil-converted numbers (R$500 / 6.2 = £80, R$1,300 / 6.2 = £210).

## 1. Market evidence (UK, 2026)

Source A: Connection Technologies, "Cyber Security Cost UK 2026" (updated 11 Jun 2026)
- Managed cyber per user/month: Essentials £6-12, Standard £15-22, 24/7 Premium £25-35
- Their own warning: £5/user "managed cyber" is "antivirus with marketing"
- Cyber Essentials via partner £500-1,500; renewal £500-800; CE Plus £2,500-5,000 all-in (IASME audit £1,400 + assessor £1,000-3,500)
- Office-hours MDR £10-18/endpoint/month; 24/7 MDR £15-35
- Standalone managed SOC £800-3,500/month for SMBs
- External pen test £3,500-7,500; web app £5,000-15,000
- IR retainer £3,000-15,000/year; managed IT helpdesk £55-65/user/month

Source B: CB Solve, "Cybersecurity consultant cost UK" (2026)
- Day rates: junior £600-1,200, mid £1,200-2,000, senior £2,000-3,200
- Retainers save 15-30% vs hourly; remote cheaper than on-site; London +10-20%
- Boutique published prices: Assurance Review £750, retained advisory from £2,000/month, project work from £350/hour

Source C: Atlant Security, "Cybersecurity consulting services 2026 guide"
- Prices quoted in USD (not directly UK): IT security audit $5k-25k, risk assessment $6k-20k, SOC 2 readiness $12k-60k
- Qualitative: quotes vary 5x on scope and retesting; buyers should price the same written scope; trigger-led buying (questionnaire, insurer, regulator)
- Use for positioning only, not for number-setting (USD, US-weighted)

## 2. Positioning

Boutique, fixed-scope, evidence-led. Priced above "cheap offshore" signals (sub-£5/user, £80 for 30 hosts) and below Big Four/partner-led firms. Target the floor-to-lower-middle of mid-level consultant day rates, because delivery is remote and fixed-scope.

## 3. Approved price book

Security Evidence Review (primary offer, fixed scope, paid)
- Up to 25 staff: £1,250
- 26-75 staff: £2,250
- 76-150 staff: £3,950
- Includes written report, ranked fix list, questionnaire-ready evidence pack, 30-min readout. Retest of fixed items within 30 days included (Atlant: excluding retests is how quotes mislead).
- The homepage links to the detailed offer page; it does not display the starting price.

Cyber Essentials (separately commissioned)
- CE: £750 + IASME fee at cost (UK market £500-1,500)
- CE Plus: £1,750 + audit/assessor costs (market £2,500-5,000 all-in)

Managed monitoring (Zabbix, business hours, optional, quoted separately)
- Platform and onboarding: £950 one-off
- Monthly: £450 minimum covers up to 30 hosts; £9 per additional host
- Business-hours response. 24/7 cover only under a separately costed SLA (existing test requires this wording)
- Rationale: office-hours MDR is £10-18/endpoint; our host monitoring is lighter than MDR but the floor must not read as cheap. £450/30 = £15/host/month effective at the minimum.

Advisory retainer (vCISO-lite)
- 4 hours/month £900; 8 hours/month £1,650; 16 hours/month £3,000
- Equivalent hourly £225 / £206 / £188, under CB Solve project rate £350 and consistent with the 15-30% retainer discount

Ad hoc day rate: not approved for publication. Quote separately.

## 4. Margin sanity check (ASSUMPTIONS, confirm with Tchize and Andre)

- Cost of delivery assumed at £350-450/day blended (founder time plus tooling). Evidence Review for up to 25 staff assumed 1.5-2 days: cost about £700-900, margin about 28-44%. Needs real hour tracking on the first 3 jobs.
- Monitoring at 30 hosts: assumed 3-4 hours/month ongoing, cost about £150-200, margin about 55-65%.
- If actual hours exceed assumptions by 30%, the Review tier 1 margin drops near 10%. Revisit after 3 engagements.

## 5. Offer page and trial logic

- The free 15-day trial from the Brazil page does not transfer. A paid, fixed-scope Evidence Review is the UK front door. Scoping-call requests use a working email fallback until a real booking URL is verified.
- Qualifying fields instead of free-text: sector, staff count, trigger (customer questionnaire / insurer / regulator / incident / other), deadline, current certification. These feed the Systeme.io contact's account-specific enquiry custom field via worker/lib/crm.js; the slug still needs verification.

## 6. Remaining integration

- Systeme.io booking has no verified public URL. Keep the email scoping fallback; replace it only after the actual booking destination is verified.
