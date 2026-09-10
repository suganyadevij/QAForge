# QAForge

## CI/CD

This project uses Jenkins Pipeline as Code, defined in the [Jenkinsfile](Jenkinsfile) at the repository root. On each run, the pipeline checks out the repository, installs npm dependencies, installs the Playwright Chromium browser, executes the Playwright test suite against the `chromium` project, and publishes the resulting HTML report as a Jenkins build artifact — even when tests fail, so failures can be investigated.

Test credentials (`EMAIL` and `PASSWORD`) are never hard-coded. They are injected securely at runtime via Jenkins Credentials Binding, using a Jenkins-managed "Username with password" credential, and are masked from console output.
