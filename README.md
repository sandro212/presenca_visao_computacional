Alunos:

Sandro Altenhofen Junior 
Luiz Francisco Bonbonato da Silva

Tivemos problemas em capturar o áudio na demonstração

# Chamada Automática por Reconhecimento Facial

Este é um sistema web que faz a chamada de uma turma sozinho, usando a webcam e
reconhecimento facial. A ideia é simples: você cadastra cada aluno com um nome e
uma foto e, na hora da chamada, basta apontar a câmera. O sistema detecta os
rostos, descobre quem é quem entre os alunos cadastrados e marca a presença
automaticamente, sem deixar ninguém duplicado na lista.

Por baixo dos panos, ele detecta os rostos com Haarcascade (do OpenCV) e faz o
reconhecimento com a biblioteca face_recognition. O projeto é dividido em duas
partes que conversam entre si: um backend em Python com FastAPI e um frontend em
React com Vite e TypeScript.

## Como funciona

O fluxo é bem direto. No cadastro, você informa o nome do aluno e envia uma
foto; o backend confere se há um rosto na imagem, guarda a foto e gera uma
"assinatura" facial (o encoding) que será usada depois para comparação. Na
chamada, o frontend liga a webcam e, a cada dois segundos, manda um quadro da
imagem para o backend. Esse quadro é analisado: os rostos são detectados,
comparados com os alunos já cadastrados e, quando há correspondência, a presença
é registrada com data, hora e o percentual de confiança do reconhecimento.
Rostos desconhecidos são simplesmente ignorados, e quem já está na lista não é
registrado de novo.

Nesta primeira versão não há banco de dados. Tudo fica salvo em arquivos dentro
da pasta `data/`, que é criada automaticamente: as fotos ficam em `data/alunos/`,
os alunos cadastrados em `data/alunos.json` e as presenças em
`data/presencas.json`. Se quiser começar do zero, é só apagar o conteúdo dessa
pasta.

## O que você precisa antes de começar

Você vai precisar do Python 3.12, do Node.js (versão 20.19 ou mais nova) com o
npm, e de uma webcam com um navegador atual como Chrome, Edge ou Firefox.

Um detalhe importante: a biblioteca face_recognition depende do dlib, que é
compilado em C++ na hora da instalação. Por isso é preciso ter o CMake e um
compilador C++ no computador. No Windows, instale o CMake (marcando a opção para
adicioná-lo ao PATH) e o Visual Studio Build Tools com a carga de trabalho de
desenvolvimento em C++. No Linux, normalmente basta `sudo apt install
build-essential cmake`. No macOS, rode `xcode-select --install` e
`brew install cmake`.

## Rodando o backend

O backend e o frontend rodam ao mesmo tempo, cada um no seu próprio terminal.
Comece pelo backend. Abra um terminal, entre na pasta `backend` e crie um
ambiente virtual com `python -m venv .venv`. Em seguida, ative esse ambiente: no
Windows (PowerShell) o comando é `.\.venv\Scripts\Activate.ps1`; no Linux ou
macOS é `source .venv/bin/activate`.

Com o ambiente ativo, instale as dependências. Por causa do dlib, vale instalar
o CMake primeiro com `pip install cmake` e depois `pip install -r
requirements.txt`. Essa primeira instalação pode demorar alguns minutos, então é
normal ter um pouco de paciência aqui.

Quando terminar, suba o servidor com `uvicorn app.main:app --reload --port
8000`. O backend fica disponível em http://localhost:8000 e você pode conferir a
documentação interativa da API em http://localhost:8000/docs.

## Rodando o frontend

Agora abra um segundo terminal, entre na pasta `frontend` e instale as
dependências com `npm install`. Depois é só iniciar o servidor de
desenvolvimento com `npm run dev`. O endereço aparece no terminal, normalmente
http://localhost:5173 — abra ele no navegador.

Vale lembrar que o frontend espera encontrar o backend em
http://localhost:8000 (isso está definido em `frontend/src/services/api.ts`) e o
backend libera o acesso para o frontend em http://localhost:5173. Se você mudar
alguma dessas portas, ajuste os dois lados.

## Usando o sistema

Com tudo rodando, abra http://localhost:5173 no navegador. Vá até a aba de
cadastro, digite o nome do aluno, escolha uma foto nítida e de frente (com apenas
um rosto) e clique em cadastrar. Repita para cada aluno da turma.

Depois é só ir para a aba de chamada, permitir o acesso à webcam quando o
navegador pedir e clicar em iniciar. A cada dois segundos o sistema analisa a
imagem e, ao reconhecer alguém, adiciona a pessoa à lista de presença na hora,
mostrando o nome, o horário e a confiança do reconhecimento. Quando terminar, é
só pausar a chamada.

## A API, em resumo

O backend expõe alguns endpoints simples. Para cadastrar um aluno, usa-se
`POST /students` enviando o nome e a foto como formulário (multipart). Para listar
os alunos cadastrados, `GET /students`. Durante a chamada, cada quadro da webcam
é enviado para `POST /attendance/recognize`, que devolve os alunos reconhecidos
naquele momento. A lista completa de presença pode ser consultada em
`GET /attendance`, e as fotos dos alunos são servidas em `GET /photos/{arquivo}`.
Todos esses endpoints estão documentados e podem ser testados direto pela
interface em http://localhost:8000/docs.

## Se algo der errado

O problema mais comum é a instalação do face_recognition ou do dlib falhar. Quase
sempre é porque falta o CMake ou o compilador C++ — confira a seção de
pré-requisitos e tente instalar o CMake antes das outras dependências. Se o
navegador reclamar que não consegue acessar a webcam, verifique se você deu a
permissão de câmera; o acesso à webcam só funciona em localhost ou HTTPS. Se
aparecerem erros de CORS no console, confirme que o backend está na porta 8000 e
o frontend na 5173. E se um aluno não estiver sendo reconhecido, geralmente
ajuda melhorar a iluminação e chegar mais perto da câmera — o limite de
correspondência fica em `face_recognition_service.py`, caso queira ajustar.