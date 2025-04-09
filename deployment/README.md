## 1. CREATE SUI WALLET
```shell
root@8445d7cc2c54:/# sui client new-address ed25519 word12
```

## 2. FROST 
FROST is the smaller unit of WAL, similar to MIST for SUI. The conversion is also the same as for SUI: 1 WAL = 1 000 000 000 FROST.

## 3. FAUCET 0.1 WAL
```shell
walrus get-wal --amount 100000000
```

## 4. RUN PUBLISHER
```shell
walrus publisher --sub-wallets-dir /root/walrus --bind-address 0.0.0.0:9696 --max-body-size 10737418240 --n-clients 1
```

## 5. RUN AGGREGATOR
```shell
walrus aggregator --bind-address 0.0.0.0:9696
```

## 6. SUI switch to mainnet
```shell
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
sui client switch --env mainnet
```

## 7. Delete Blob
```shell
walrus delete --context mainnet --blob-ids=pXa31tS2hpTOUZq7SqB3pYW8FrIWjUAigjZI1bqo4wQ
```

## 8. TRANSFER
```shell
sui client transfer --to 0xa2861cc6af63b50169d4a4030343a65d07fd7f1eb7a963f74073950bd72e0473 --object-id 0x2f46f16a7a7f80303c114aa74a101e5c2f2e1e9fd9f3642a0b07b77ec23ac81f
```

## 9. Tusky
```shell
fee parade suspect focus alert sail such rather elephant credit athlete differ evolve industry meat time diary skate sea science rural miss pet liar
```

