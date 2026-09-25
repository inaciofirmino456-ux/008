# Aave V3 Flash Loan — Ethereum Sepolia

Projeto de teste para aprender o fluxo de um flash loan com Aave V3 em **Ethereum Sepolia**.

O endereço oficial do Aave V3 PoolAddressesProvider usado pelo projeto é:
`0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A`.

O contrato usa `flashLoanSimple()` e não contém estratégia de arbitragem.

## Deploy pelo GitHub Actions

1. No GitHub, abra **Settings → Secrets and variables → Actions**.
2. Crie o secret `DEPLOYER_PRIVATE_KEY` com a chave privada **somente da carteira de teste Sepolia**.
3. Não coloque seed phrase nem chave privada no código ou em issues.
4. Abra **Actions → Deploy Sepolia Flash Loan Test → Run workflow**.
5. O workflow compila e faz o deploy.

A RPC Sepolia já tem um endereço público padrão no `hardhat.config.js`; não é obrigatório criar `SEPOLIA_RPC_URL`.

## Fluxo

1. O proprietário chama `requestFlashLoan(asset, amount)`.
2. O Aave Pool envia o ativo para o contrato.
3. O contrato executa `executeOperation()`.
4. O contrato aprova `amount + premium` para o Pool.
5. O Pool liquida o empréstimo.

**Importante:** para uma chamada real de flash loan, o contrato precisa ter saldo suficiente do ativo para cobrir o `premium`, porque o valor emprestado sozinho não inclui essa taxa. Primeiro fazemos o deploy; depois testamos o ativo e a liquidez disponíveis na Sepolia.

## Ativos Aave V3 Sepolia

O address book oficial lista, entre outros, DAI, USDC, WETH e GHO como ativos da implantação Sepolia. Os endereços devem ser obtidos do address book oficial antes de uma chamada.

## Segurança

- Use apenas uma carteira criada para Sepolia.
- Nunca envie a chave privada ou seed phrase para o chat.
- Nunca use a chave de uma carteira com fundos reais.
- Este projeto é para testnet; não há deploy em mainnet.
