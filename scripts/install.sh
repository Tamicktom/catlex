#!/usr/bin/env bash
set -euo pipefail

REPO="Tamicktom/catlex"
INSTALL_DIR="${HOME}/.local/bin"
BINARY_NAME="catlex"
ASSET_NAME="catlex-linux-x64"

if [[ -n "${CATLEX_VERSION:-}" ]]; then
  DOWNLOAD_URL="https://github.com/${REPO}/releases/download/v${CATLEX_VERSION#v}/${ASSET_NAME}"
else
  DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${ASSET_NAME}"
fi

mkdir -p "${INSTALL_DIR}"

TMP_FILE="$(mktemp)"
trap 'rm -f "${TMP_FILE}"' EXIT

echo "Downloading catlex from ${DOWNLOAD_URL}..."
curl -fsSL "${DOWNLOAD_URL}" -o "${TMP_FILE}"
chmod +x "${TMP_FILE}"
mv "${TMP_FILE}" "${INSTALL_DIR}/${BINARY_NAME}"
trap - EXIT

echo "Installed ${INSTALL_DIR}/${BINARY_NAME}"

case ":${PATH}:" in
  *":${INSTALL_DIR}:"*) ;;
  *)
    echo
    echo "Warning: ${INSTALL_DIR} is not in your PATH."
    echo "Add this to your shell profile:"
    echo "  export PATH=\"\${HOME}/.local/bin:\${PATH}\""
    ;;
esac
