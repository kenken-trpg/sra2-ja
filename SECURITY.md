# Security policy

## Supported versions

Security fixes are provided for the latest released version of this repository.

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub's
**Report a vulnerability** feature on this repository's Security page. Do not
include exploit details in a public issue.

## Dependency vulnerability response

- Critical or high vulnerabilities in runtime or release-build dependencies
  block a release until they are fixed or a written assessment establishes that
  the affected code is not reachable in the release process.
- Critical findings are triaged immediately. High findings are triaged within
  7 days and fixed or mitigated before the next release.
- Moderate findings are triaged and scheduled for remediation within 30 days.
- Low findings are triaged and scheduled for remediation within 90 days.
- Development-only findings are tracked separately. They block a release when
  they affect the release workflow or can affect the produced artifact.

Dependabot version updates are checked weekly. Security alerts and security
update pull requests should be enabled in the repository settings.
