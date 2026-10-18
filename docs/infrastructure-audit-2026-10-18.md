# Top Cosmetics infrastructure audit — 18 October 2026

## Outcome and scope

**DNS filtering was reproduced on the execution network.** System DNS returned `ap-blockpage.prod.bzq.securingsam.com` for the clinic domain and subdomains. Google and Cloudflare DNS-over-HTTPS returned the intended hosting addresses. HTTPS using system DNS failed certificate hostname validation; HTTP to the three application subdomains returned a `BCyber Site Blocked` page. This is evidence of interception on this network, not proof that the origin certificates are invalid.

The reason for the classification remains unknown. A false positive warrants investigation; neither poor SEO nor domain age is an established cause. No unblock has been verified.

Reviewed the landing repository, generated static files, deployment workflow, public DNS, registration data and public network responses. No authenticated Cloudflare, Hostinger, Kamatera, Search Console or reputation-service access was available. No Nginx or Node application configuration was present in this checkout. No DNS, hosting, production application, account or filtering settings were changed. Changes are local and have not been deployed.

Raw, timestamped observations: [audit-evidence-2026-10-18.json](audit-evidence-2026-10-18.json). Reproduce using `node scripts/audit-public.mjs > audit-evidence.json` from a network you want to test. The script makes bounded read-only requests, submits no scans, supplies no credentials and never disables TLS verification. Its origin IPs are this audit's snapshot; update them if the hosting assignment changes.

## DNS — Cloudflare / registrar

| Host | Google and Cloudflare A answers | Interpretation |
| --- | --- | --- |
| `topcosmeticsclinic.com` | `147.93.73.209` | Landing address observed publicly; confirm against Hostinger hPanel |
| `www.topcosmeticsclinic.com` | CNAME to apex, A `147.93.73.209` | Consistent alias |
| `crm.topcosmeticsclinic.com` | `81.28.7.42` | Matches owner-supplied VPS address |
| `book.topcosmeticsclinic.com` | `81.28.7.42` | Matches owner-supplied VPS address |
| `intake.topcosmeticsclinic.com` | `81.28.7.42` | Matches owner-supplied VPS address |

Google returned no AAAA addresses for these five names. No conflicting IPv6 route was observed. Public nameservers are `hazel.ns.cloudflare.com` and `sage.ns.cloudflare.com`; observed A/CNAME TTLs were 300 seconds. No stale record or Hostinger/Kamatera routing conflict was found in this sample. Two public resolver views do not establish worldwide propagation or reveal every record in the Cloudflare zone.

Google returned no parent DS or zone DNSKEY. Registry RDAP reports `delegationSigned: false`. **DNSSEC is currently unsigned**, rather than an observed broken signed delegation. No CAA record was returned for the apex; absence alone is not a fault.

System DNS instead returned the SAM blocking CNAME, with a 30-second TTL. In the saved capture it resolved to `63.187.152.222` and `2a05:d014:c59:1a01:adf6:811d:30b2:6d53`. These are observed blocking endpoints, not replacement hosting addresses; the endpoint IPv6 address varied between probes.

Proposed changes, requiring owner approval before application:

1. Confirm the full Cloudflare record inventory, including wildcards, CNAMEs, AAAA, mail, verification TXT and any registrar DS records. Preserve mail and verification records. No A/AAAA/CNAME change is justified by the sampled public answers.
2. Enable Cloudflare DNSSEC and publish its exact DS at the registrar, then verify the validating chain. This improves DNS authenticity; it does not force a filtering provider to remove a classification. Follow [Cloudflare DNSSEC documentation](https://developers.cloudflare.com/dns/dnssec/).
3. Consider proxying public web hosts only after verifying each origin certificate, origin connectivity and application behavior. Use **Full (strict)**, which requires a valid matching origin certificate; never Flexible. See [Cloudflare Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/). Proxying is not a verified remedy for hostname-based filtering.
4. Before proxying CRM/intake, ensure authenticated HTML, APIs, intake tokens and personalized booking flows are not cached. Test redirects, cookies, WebSockets if used, uploads, webhooks, client-IP handling and certificate renewal. Configure trusted proxy addresses before honoring forwarded client information. Do not apply blanket bot challenges to booking/payment callbacks.
5. Add CAA only after listing every CA required by Hostinger, Let's Encrypt and any future Cloudflare edge certificate issuance; an incomplete restriction can break renewal.

## TLS, HTTP and Kamatera

| Probe | Verified observation | What it does not establish |
| --- | --- | --- |
| Normal HTTPS, all five names | curl exit 60, `SEC_E_WRONG_PRINCIPAL` | Origin certificate SANs, issuer, expiry or chain validity |
| HTTP CRM/book/intake | 200, `Sam-Cookie`, filtering HTML | Application status codes, redirects or security headers |
| CRM HTTP body | `BCyber Site Blocked`, JavaScript redirect to SAM block page | A malicious redirect in the clinic's own application |
| Direct-IP HTTPS with correct Host/SNI, Hostinger | Connection timeout | Origin is down for other networks |
| Direct-IP HTTPS with correct Host/SNI, VPS | Connection reset | Origin certificate is bad |
| Apex HTTP | Timeout or gateway 504 on this filtered route | Hostinger redirect configuration |

No credentials were sent to an intercepted endpoint. Certificate verification remained enabled. The actual Let's Encrypt certificates and origin headers **remain unverified**. Web browsing also failed to retrieve the public landing page, so independent external crawler accessibility was not demonstrated.

Kamatera administrator checks, to run locally on the server or from an unaffected network:

```sh
sudo nginx -t
sudo nginx -T
sudo certbot certificates
sudo certbot renew --dry-run
sudo ss -lntup
```

Keep full configuration output private; it can contain sensitive settings. Review exact `server_name` mappings for each host; each port-80 vhost should redirect to its own fixed HTTPS hostname. Check port-443 `fullchain.pem` and `privkey.pem` paths, matching certificate SANs, expiry, renewal timer and renewal reload hook. A working port-80 ACME challenge must remain reachable if HTTP-01 renewal is used. Check that unmatched hosts do not expose another application's content.

From an unaffected network, verify certificates using the real SNI hostname, for example:

```sh
curl --resolve crm.topcosmeticsclinic.com:443:81.28.7.42 -I https://crm.topcosmeticsclinic.com/
openssl s_client -connect 81.28.7.42:443 -servername crm.topcosmeticsclinic.com -verify_hostname crm.topcosmeticsclinic.com -verify_return_error </dev/null
```

Repeat for book/intake and both landing hostnames. Do not use `curl -k`. Record SAN, issuer, validity dates and successful trusted-chain/hostname validation before describing SSL as healthy.

Indexing and security recommendations for the application owner, **not applied**:

- CRM and intake: require appropriate authentication or scoped expiring intake tokens; prevent enumeration and sensitive content in responses/logs. Apply `X-Robots-Tag: noindex, nofollow, noarchive` on all responses, including errors. Keep private responses `Cache-Control: no-store`. A header is not access control. Robots rules on the landing host cannot control another subdomain.
- Do not rely on `Disallow` to remove indexed URLs: crawlers must be able to see `noindex` on publicly reachable pages. Follow [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing). Authentication remains the primary protection for private data.
- Booking: allow indexing only of intended public, useful booking information with clean canonical URLs. Keep customer-specific links, appointment details, confirmation/cancellation routes and token-bearing URLs out of indexes and sitemaps, with `noindex` and suitable access controls. Do not blanket-noindex all booking routes without reviewing their purpose.
- Review `nosniff`, referrer policy, framing policy and a CSP compatible with the existing applications. Validate embedding requirements before denying framing. Nginx `add_header` inheritance changes when headers are added at a child scope; retain the complete intended header set and use `always` where appropriate.
- Bind Node/database/admin listeners to loopback or a private interface unless explicitly required publicly. Review both host and Kamatera firewalls; expose web ports and restricted administrative access as needed. No port scan or authenticated service inventory was performed, so unnecessary services and sensitive exposure are unresolved.

## Landing SEO and security

Existing behavior confirmed in source and built output:

- Static HTML with crawlable content and links; no client rendering dependency for the main content. Mobile viewport, explicit image dimensions and local fonts are present. This establishes basic mobile crawlability, not a measured Core Web Vitals score or a browser layout audit.
- Arabic `/` and Hebrew `/he/`, both `dir="rtl"`; localized unique titles, descriptions, self-canonicals, reciprocal hreflang and `x-default` are present. No default-language redirect based on browser language.
- Public robots.txt allows crawling and advertises the correct HTTPS sitemap. All 38 public pages are listed; 404 is excluded and has noindex metadata and no canonical. `.htaccess` configures a real error document, but live 404 status handling still needs Hostinger verification.
- BeautySalon, Service, FAQPage, Person and BreadcrumbList builders use existing content. No aggregate rating, fabricated reviews, qualifications or new business details were added. Schema syntax is checked locally; Google eligibility and actual indexing remain separate questions.
- No suspicious or obfuscated redirect/script was found in reviewed landing source. The only optional remote script is consent-gated Google Analytics. The SAM redirect was fetched from the intercepted network response, not found in project source. This source review is not a clean bill of health for deployed hosting or the separate applications.
- External links: Google profile/review, Instagram, Facebook and the footer credit returned 200 after redirects during HEAD checks. Waze timed out and is unresolved, not proven broken. Link availability does not verify that the business destinations are correct. No external link was removed without evidence of breakage.

Implemented locally:

| File | Change / reason |
| --- | --- |
| `public/.htaccess` | Fixed canonical HTTPS destination instead of reflecting arbitrary Host; removed trust in client-supplied `X-Forwarded-Proto`; HTTP+www now share one canonical-host rule |
| `public/.htaccess` | Legacy Arabic redirect matches only `/ar` and `/ar/…`, not unrelated paths starting with `ar`; absolute fixed-host destination prevents a captured leading slash becoming another host |
| `public/.htaccess` | Added limited CSP restricting base URLs, objects, framing and form targets; retained inline scripts/styles and optional analytics compatibility. This is not a full script allowlist |
| `public/.htaccess` | Added `X-Robots-Tag` for `404.html`; retained existing nosniff, referrer, framing and permissions headers |
| `src/pages/sitemap.xml.ts` | Removed build-time `lastmod`; dates must describe actual content changes. See [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) |
| `src/config/schema.ts` | Omitted street-centre coordinates and unverified founding year from machine-readable business facts; retained existing visible content and contact details |
| `src/layouts/Base.astro` | Escaped `<` during JSON-LD serialization so future content cannot close its script element |
| `scripts/check-seo.mjs`, `package.json` | Added built-output SEO, local link/asset, JSON-LD and sitemap coverage checks to the existing deployment check command |
| `scripts/audit-public.mjs` | Added bounded read-only network evidence collector |
| `README.md` | Corrected DNS verification instructions to Cloudflare and current Arabic/Hebrew URLs; linked audit and remediation report |

No CSS, layout, visible copy or application functionality changed. All 39 generated HTML bodies have identical SHA-256 hashes to the pre-change build output.

Security limitation: the existing workflow defaults to unencrypted FTP when `FTP_PROTOCOL` is unset. Confirm Hostinger support, then set that variable to `ftps` and test deployment. No transport setting was changed blindly. Keep repository secrets private and deploy only `dist/`.

`npm audit --omit=dev --json` found one high-severity transitive issue: `http-cache-semantics@4.2.0`, used by Astro. [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) describes cross-user shared-cache disclosure; the advisory lists no patched version. Although npm says a fix is available, no speculative upgrade/downgrade was applied. This website ships static files, not that Node dependency; no deployed shared-cache exposure was demonstrated. Track the upstream fix and update the lockfile when a verified compatible remedy exists. Do not use `npm audit fix --force` blindly.

HSTS was not added while origin TLS is unverified; especially avoid parent-domain `includeSubDomains`/preload until every application is verified. Security headers seen on a filtering response must not be attributed to the clinic.

## Reputation and indexing

| Service / indicator | Result | Status |
| --- | --- | --- |
| Verisign RDAP | Registered `2026-09-02T16:08:37Z`; expires `2028-09-02T16:08:37Z`; Hostinger registrar; transfer-prohibited status | Verified; about 46 days old on audit date |
| Bezeq/SAM filtering | Blocking CNAME, blocked HTML and certificate mismatch reproduced | Verified for this execution network |
| URLScan existing public search | `total: 0`, `search_date_limit_days: 30` | No records returned in the API's stated search window; no safety verdict; no scan submitted |
| Google Safe Browsing | Public report could not be retrieved in browser tool | Unknown; no clean or malicious verdict obtained |
| VirusTotal | Domain report could not be retrieved | Unknown; no authenticated API or engine results |
| Cisco Talos | Lookup could not be retrieved | Unknown; no category/reputation verdict |
| Search Console | No authenticated property access | Indexing, manual actions, security issues and sitemap processing unknown |
| Other blocklists / external scanners | No comprehensive dataset or completed malware scan | Unknown; absence of search results is not evidence of absence from blocklists |

Useful owner lookups: [Safe Browsing](https://transparencyreport.google.com/safe-browsing/search?url=topcosmeticsclinic.com), [VirusTotal domain](https://www.virustotal.com/gui/domain/topcosmeticsclinic.com), [Talos](https://talosintelligence.com/reputation_center/lookup?search=topcosmeticsclinic.com), [URLScan search](https://urlscan.io/search/#domain:topcosmeticsclinic.com), [Search Console](https://search.google.com/search-console). Check all affected hosts. Never submit patient URLs, intake tokens or authenticated/private routes to public scanners. VirusTotal aggregates vendor judgments; disputes belong with the detecting vendor, per [VirusTotal false-positive guidance](https://docs.virustotal.com/docs/false-positive).

## Remaining actions by owner

1. **Bezeq, highest priority:** submit [the prepared reclassification request](bezeq-reclassification-request.md) with the evidence file. Use [Bezeq's published technical-support contacts](https://www.bezeq.co.il/serviceandsupport/contactus/) and request escalation to BCyber/SAM classification support. Their page lists 166 from a Bezeq line and 1800-335-166. Obtain a case number and ask for the precise category/reason and scope (apex, subdomains, wildcard, URL or IP). No message was sent on your behalf.
2. **Hostinger:** confirm `147.93.73.209` in hPanel, verify apex+www certificate coverage and HTTPS behavior from an unaffected ISP, then deploy reviewed `dist/` through the existing workflow or approved upload path. Preserve `.htaccess`. Check its directives are supported by the actual LiteSpeed/Apache configuration. Roll back the changed files if server errors or loops occur.
3. **Hostinger live verification:** expect 200 on `/`, `/he/`, robots and sitemap; 301 to canonical HTTPS for HTTP and www; `/ar/about/` → `/about/`; unrelated `/arbitrary/` should remain a 404; missing paths must return HTTP 404, never a 200 home page. Verify CSP and other headers on both success and error responses. Apache/LiteSpeed was unavailable locally, so redirect/header runtime checks remain open.
4. **Cloudflare/registrar:** review full zone and DNSSEC/proxy proposals above; approve each DNS change explicitly before application. No DNS record needs replacing with a SAM endpoint.
5. **Kamatera:** complete certificate/vhost/renewal, private indexing, authentication, cache and listener/firewall review above. Keep booking and CRM behavior intact; obtain the app owner's review before any production configuration edit.
6. **Search Console:** verify a Domain property with Google's exact TXT value at Cloudflare, review Security Issues and Manual Actions, submit the sitemap, inspect `/` and `/he/` including Google's selected canonical, and request indexing after stable origin access is confirmed. Review exclusions instead of repeatedly resubmitting URLs.
7. **Clinic content:** confirm the exact address/pin, founding year, hours, treatment descriptions, practitioner roles and existing experience/client-count claims in both languages. README already marks much of the content as draft. No qualifications or medical claims were invented or rewritten during this infrastructure task. Confirm the same name/address/phone in the Google Business Profile.
8. **After provider response:** wait for the provider's stated propagation window, then repeat system DNS, HTTPS and booking checks on affected Bezeq lines and another Israeli ISP. Keep certificate validation on. A public-resolver success alone is insufficient to declare unblocking.

## Validation completed

- `npm run check:i18n`: passed, 498 Arabic strings match Hebrew keys.
- `npm run build`: passed, 39 HTML pages built; existing unused-image pruning passed.
- `npm run check:site`: passed language and deposit-policy checks plus new SEO checks: 38 indexable pages, exact 38-URL sitemap coverage, 1,326 local link/asset references, JSON-LD parsing and 404 metadata.
- SHA-256 comparison: all 39 generated HTML bodies unchanged.
- `git diff --check`: passed (only line-ending notices).
- `npm audit --omit=dev`: completed with the single unresolved high advisory described above; this check does not pass cleanly.
- Production TLS, redirect/status behavior, application security and server header verification: unresolved due to interception/origin connection failure and lack of server configuration access. No production deployment was performed.
