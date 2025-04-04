# Walrus Decentralized Storage

Walrus Decentralized Storage is a decentralized storage app using the Walrus protocol to store encrypted files reliably and affordably, even under Byzantine faults.

All encryption and decryption happens in-browser with no network connection, ensuring your keys never leave your device.

Files are encrypted with AES-256-CBC using the Web Crypto API. Keys are derived via PBKDF2 (10,000 SHA-256 iterations).
The encryption is OpenSSL-compatible.

To decrypt with OpenSSL, use:

```shell
openssl aes-256-cbc -d -salt -pbkdf2 -iter 10000 -in encryptedfilename -out plaintextfilename
```

Files encrypted with the following OpenSSL command can be decrypted on this page:

```shell
openssl aes-256-cbc -e -salt -pbkdf2 -iter 10000 -in plaintextfilename -out encryptedfilename
```

Encryption keys are stored locally. To access your files on another device, use the import/export feature to migrate your keys. If not, your keys — and access to your files — will be permanently lost. Even the developers cannot recover them.

Public testing is available via the Walrus system. For convenience, test interfaces are hosted at:

* Aggregator: https://aggregator-devnet.walrus.space
* Publisher: https://publisher-devnet.walrus.space

The Walrus publisher currently limits uploads to 10 MB. To upload larger files, you’ll need to run your own publisher.

## File explorer
![explorer.png](doc%2Fexplorer.png)

## Upload file

### Step 1: Encrypt file

![ENCRYPT.png](doc%2FENCRYPT.png)

### Step 2: Upload to Walrus

![Upload.png](doc%2FUpload.png)

## Image preview
![preview.png](doc%2Fpreview.png)
