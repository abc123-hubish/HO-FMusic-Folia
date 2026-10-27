# Native QQ and KuGou protocol

`upstream/` is copied without edits from whycfawa/folia-android commit
`54bb066bd83dec2a29c44dc60934bdf8ac0e24d6` (AGPL-3.0).
Source: https://github.com/whycfawa/folia-android/tree/54bb066bd83dec2a29c44dc60934bdf8ac0e24d6/src/nativeBridge

`build-music.mjs` selects only the QQ/KuGou route declarations with the bundler's
parser. NetEase and Bodian are excluded. It injects native HTTP, URL, binary,
cookie and storage primitives, then generates a separate closure for each native
provider. The upstream files are preserved for review and protocol updates.

`host.mjs` processes redirects and separate Set-Cookie values. `runtime.mjs`
limits operations, serializes each provider's requests and strips account secrets
before returning results to ArkWeb. Persistent state uses the native Asset Store.
External API configuration remains supported and takes precedence when filled in.

License notices are copied into the HAP's `music-licenses` rawfile directory.
The vendored CryptoJS distribution retains its MIT notice; buffer and qrcode
retain their package licenses. Rebuild with `node tools/build-music.mjs`.
