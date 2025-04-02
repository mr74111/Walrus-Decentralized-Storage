1. CREATE SUI WALLET
root@8445d7cc2c54:/# sui client new-address ed25519 word12
Config file ["/root/.sui/sui_config/client.yaml"] doesn't exist, do you want to connect to a Sui Full node server [y/N]?y
Sui Full node server URL (Defaults to Sui Testnet if not specified) :
Select key scheme to generate keypair (0 for ed25519, 1 for secp256k1, 2: for secp256r1):
0
Generated new keypair and alias for address with scheme "ed25519" [infallible-sphene: 0xa2861cc6af63b50169d4a4030343a65d07fd7f1eb7a963f74073950bd72e0473]
╭──────────────────────────────────────────────────────────────────────────────────────╮
│ Created new keypair and saved it to keystore.                                        │
├────────────────┬─────────────────────────────────────────────────────────────────────┤
│ alias          │ word12                                                              │
│ address        │ 0xfbb24de89fa02dc7c2c4cecb65d98d595f54cd8cc6a2447c0ce05a1fbcd20ad8  │
│ keyScheme      │ ed25519                                                             │
╰────────────────┴─────────────────────────────────────────────────────────────────────╯

2. FROST is the smaller unit of WAL, similar to MIST for SUI. The conversion is also the same as for SUI: 1 WAL = 1 000 000 000 FROST.

3. FAUCET 0.1 WAL
walrus get-wal --amount 100000000

4. RUN PUBLISHER
walrus publisher --sub-wallets-dir /root/walrus --bind-address 0.0.0.0:9696 --max-body-size 10737418240 --n-clients 1

5. RUN AGGREGATOR
walrus aggregator --bind-address 0.0.0.0:9696

6. TRANSFER
sui client transfer --to 0xa2861cc6af63b50169d4a4030343a65d07fd7f1eb7a963f74073950bd72e0473 --object-id 0x2f46f16a7a7f80303c114aa74a101e5c2f2e1e9fd9f3642a0b07b77ec23ac81f