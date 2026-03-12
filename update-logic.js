import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

const SITE_URL = "https://gamevault164.github.io/GAMEVAULT-APP";

async function verificarAtualizacao() {
    const statusTexto = document.getElementById('status-texto');
    
    try {
        // 1. Verifica a versão online no GitHub
        const resposta = await fetch(`${SITE_URL}/versao.json?t=${new Date().getTime()}`);
        const dadosOnline = await resposta.json();
        
        // 2. Verifica a versão que está guardada no telemóvel
        const versaoLocal = await Preferences.get({ key: 'versaoApp' });

        if (dadosOnline.versao !== versaoLocal.value) {
            console.log("Nova versão encontrada! A descarregar do site...");
            statusTexto.innerText = "A descarregar nova versão...";

            // 3. Descarrega os ficheiros atualizados
            for (const ficheiro of dadosOnline.ficheiros) {
                const resFicheiro = await fetch(`${SITE_URL}/${ficheiro}`);
                const textoFicheiro = await resFicheiro.text();

                // Guarda no armazenamento interno da app
                await Filesystem.writeFile({
                    path: `gamevault_app/${ficheiro}`,
                    data: textoFicheiro,
                    directory: Directory.Data,
                    encoding: 'utf8'
                });
            }

            // Atualiza o registo da versão local
            await Preferences.set({ key: 'versaoApp', value: dadosOnline.versao });
        }

        // 4. Redireciona a Web View para ler os ficheiros atualizados
        statusTexto.innerText = "A iniciar...";
        const urlLocal = await Filesystem.getUri({
            path: 'gamevault_app/index.html',
            directory: Directory.Data
        });
        
        // Carrega o jogo a partir do armazenamento interno
        window.location.href = urlLocal.uri;

    } catch (erro) {
        console.error("Erro ao atualizar (pode estar offline):", erro);
        // Se falhar ou estiver sem internet, tenta abrir a versão local que já existe
        window.location.href = "index.html"; 
    }
}

verificarAtualizacao();