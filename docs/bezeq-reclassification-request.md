# Request to investigate BCyber/SAM domain classification

To: Bezeq technical support / BCyber / SAM security classification team

Subject: Suspected false positive — topcosmeticsclinic.com and application subdomains

Please investigate the security classification of our Top Cosmetics Clinic website and related applications. Legitimate customers on affected Bezeq connections cannot reach them. We request manual review, reclassification, and removal of any erroneous blocking following your investigation.

Affected names and intended destinations:

| Name | Intended service | Expected address |
| --- | --- | --- |
| `topcosmeticsclinic.com` | Public clinic website on Hostinger | `147.93.73.209` (observed public DNS; hosting account confirmation pending) |
| `www.topcosmeticsclinic.com` | Alias of public website | CNAME to apex → `147.93.73.209` |
| `book.topcosmeticsclinic.com` | Booking on Kamatera | `81.28.7.42` |
| `crm.topcosmeticsclinic.com` | CRM on Kamatera | `81.28.7.42` |
| `intake.topcosmeticsclinic.com` | Intake on Kamatera | `81.28.7.42` |

Evidence collected on 18 October 2026; individual UTC capture timestamps are in the attached JSON:

- Google and Cloudflare DNS-over-HTTPS return the hosting addresses above.
- System DNS on the affected execution network returns CNAME `ap-blockpage.prod.bzq.securingsam.com` instead. In the attached capture this endpoint resolved to `63.187.152.222` and `2a05:d014:c59:1a01:adf6:811d:30b2:6d53` with 30-second TTLs. Its IPv6 address varied between probes.
- Normal HTTPS requests to all five affected names fail hostname validation: curl exit 60, `SEC_E_WRONG_PRINCIPAL`. Customers report Chrome `NET::ERR_CERT_COMMON_NAME_INVALID`.
- HTTP requests to book/CRM/intake return 200 with a `Sam-Cookie` header. The CRM response body is titled `BCyber Site Blocked` and redirects to your SAM block-page hostname. These are filtering responses, not the clinic application pages.
- The landing project is a static bilingual clinic website; its reviewed source contained no suspicious/obfuscated scripts or redirects. This limited source review is not a malware clearance for every deployed application.

SSL status: the owner reports Let's Encrypt certificates on Kamatera. Their origin validity has not been independently confirmed: direct-origin SNI checks from this network reset or timed out, with certificate verification enabled. The intercepted certificate-name failure alone does not establish a defect in those origin certificates. We can provide SAN/issuer/expiry and trusted-chain checks from an unaffected network when available.

This evidence supports investigation of a filtering false positive, but we do not assert a clean verdict from Safe Browsing, VirusTotal or Talos, or an established reason for your classification. The registration date is 2 September 2026; the domain's age is context, not a proven cause.

Please:

1. Provide the current category, detection reason, timestamp and relevant feed/vendor.
2. Confirm whether the decision covers the apex, individual subdomains, a wildcard, specific URLs, or an IP address.
3. Manually assess the legitimate clinic services and reclassify/remove erroneous blocking across affected Bezeq/BCyber/SAM enforcement points if your review confirms a false positive.
4. Provide a case number, review outcome and propagation window so access can be retested from affected customer lines.

Attachment: `audit-evidence-2026-10-18.json`. The report contains public diagnostics and a blocking-page response, not patient records or login credentials. Transient cookie header values have been redacted. Additional customer-line details can be supplied privately by the owner if required.

No unblock is claimed. We will verify DNS answers and successful, certificate-validated HTTPS on affected Bezeq lines after your response.
