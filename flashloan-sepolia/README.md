# Aave V3 Flash Loan — Ethereum Sepolia

Projeto de teste para aprender o fluxo de um flash loan com Aave V3 em **Ethereum Sepolia**.

Aave lista Ethereum Sepolia como rede de testnet para V3. O contrato deste projeto usa `flashLoanSimple()` e não contém uma estratégia de arbitragem.

## Fluxo

1. O utilizador chama `requestFlashLoan(asset, amount)`.
2. O Aave Pool envia o ativo para o contrato.
3. O contrato executa `executeOperation()`.
4. O contrato aprova `amount + premium` para o Pool.
5. O Pool cobra o empréstimo e a operação termina.

O contrato é intencionalmente simples: não troca tokens nem procura lucro.

## Segurança

- Nunca coloque seed phrase no GitHub.
- Nunca coloque uma chave privada diretamente no código.
- Para testes, use uma carteira criada especificamente para Sepolia.
- O deploy em mainnet não faz parte deste projeto.

## Próximo passo

Configurar uma RPC Sepolia e uma carteira de teste, compilar e fazer o deploy somente depois de revisar o contrato.
