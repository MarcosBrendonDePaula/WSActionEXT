const fs = require('fs');
const path = require('path');

/**
 * Módulo da extensão.
 * 
 * @param {Object} WSIO - Instância do WebSocket IO.
 * @param {Object} APP - Instância do Express.
 * @param {Object} RL - Instância do Readline.
 * @param {Object} STORAGE - Objeto de armazenamento compartilhado.
 * @param {Object} STORAGE.data - Objeto de armazenamento.
 * @param {Function} STORAGE.save - Função para salvar o armazenamento.
 * @param {Object} EXPRESS - Classe Express.
 * 
 * @returns {Object} - Objeto da extensão.
 */
module.exports = (WSIO, APP, RL, STORAGE, EXPRESS) => {
    // Cria um novo roteador para a extensão
    const ROUTER = EXPRESS.Router();
    
    // Nome da extensão
    const NAME = "BLOCKPICK"; 
    // Estado de habilitação da extensão
    const ENABLED = true;

    // Definição de eventos IO específicos para esta extensão
    const IOEVENTS = {
        "teste": {
            description: "Descrição do evento de teste",
            _function: (data) => {
                console.log(`${NAME} teste event received:`, data);
                // Lógica para o evento de teste
            }
        }
    };

    const COMMANDS = {
        "collectRewards": {
            description: "Coleta as recompensas do blockpick",
            _function: (data) => {
                WSIO.emit(`${NAME}:command`, {
                    command:"collectRewards",
                    data:{}
                })
            }
        },
        "syncBlocksInWallet": {
            description: "Sincroniza a quantidade de block das contas",
            _function: (data) => {
                WSIO.emit(`${NAME}:command`, {
                    command:"getWalletCoins",
                    data:{}
                })
            }
        },
        "showCurrentBlocks": {
            description: "Exibe a quantidade de blocks ",
            _function: (data) => {
                let qt = 0;
                let keys = Object.keys(STORAGE.data['BLOCKPICK']);
                keys.forEach(key => {
                    let acount = STORAGE.data['BLOCKPICK'][key]
                    try {
                        qt += acount.currentBlocksInWallet
                    } catch (error) {
                        
                    }
                });
                console.log(qt)
            }
        },
        "CollectAllBlocks": {
            description: "Exibe a quantidade de blocks ",
            _function: (data) => {
                RL.question('Digite o endereço da carteira: ', (wallet) => {
                    WSIO.emit(`${NAME}:command`, {
                        command:"CollectAllBlocks",
                        data:{ wallet }
                    })
                });
            }
        }
    }

    /**
     * Função de inicialização da extensão.
     */
    const onInitialize = () => {
        console.log(`${NAME} initialized.`);
        // Lógica adicional de inicialização, se necessário
    };

    /**
     * Função de tratamento de erros da extensão.
     * 
     * @param {Error} error - O objeto de erro capturado
     */
    const onError = (error) => {
        console.error(`${NAME} error: ${error.message}`);
        // Lógica adicional de tratamento de erros
    };
    ROUTER.get("/client", (req, res) => {
        const filePath = path.resolve(process.execDir, 'extensions', NAME, './client.js'); // Ajuste o caminho conforme necessário
        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(500).send('Erro ao carregar o arquivo.');
            }
        });
    });
    const CLIENT_LINK=`${NAME}/client`

    return {
        NAME,
        ROUTER,
        ENABLED,
        IOEVENTS,
        COMMANDS,
        CLIENT_LINK,
        onInitialize,
        onError // Expor a função de erro para ser usada externamente
    };
};
