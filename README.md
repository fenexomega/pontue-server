# Pontue-backend
Servidor REST para o backend do aplicativo de ponto PONTUE.

## TODO: Para fazer
* Documentação da API REST
  * PUT
  * POST
  * GET
* Documentação de como instalar e configurar o servidor

## Como instalar
1. Tenha instalado os seguintes pacotes:
  * NodeJS (com NPM)
  * MongoDB
  * Openssl
2. Inicie o serviço do Mongodb e garanta que ele esteja pronto para receber conexões.
3. Vá na pasta certs/ e rode o script generate_certs.sh.
  * Garanta que foram gerados os arquivos server.key e server.crt.
4. Instale as dependencias da aplicação com npm install.

## Como executar o Servidor

Após todos os passos da instalação executados, rode o servidor com
 npm start ou node server.js.


## Problemas
Registrar uma issue aqui no github com instruções de como o bug/falha aconteceu. 
