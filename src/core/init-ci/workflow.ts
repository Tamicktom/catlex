export function generateValidateMessagesWorkflow(): string {
  return `name: Validate messages

on:
  push:
  pull_request:

jobs:
  validate-messages:
    name: Validate translation messages
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install catlex
        run: curl -fsSL https://github.com/Tamicktom/catlex/releases/latest/download/install.sh | bash

      - name: Validate translations
        run: |
          export PATH="\${HOME}/.local/bin:\${PATH}"
          catlex validate --json
`;
}
