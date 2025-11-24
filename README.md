# 🎵 Metrônomo Pro

Um metrônomo web moderno, preciso e cheio de recursos para músicos de todos os níveis. Desenvolvido com tecnologias web nativas (HTML, CSS, JavaScript) e focado em performance e usabilidade.

![Metrônomo Pro Screenshot](https://via.placeholder.com/800x450?text=Metrônomo+Pro+Preview)

## ✨ Funcionalidades

### 🎧 Núcleo do Metrônomo
- **Alta Precisão**: Utiliza a Web Audio API para timing preciso, evitando flutuações comuns em `setInterval`.
- **BPM Ajustável**: Faixa de 40 a 300 BPM.
- **Sons Configuráveis**:
  - 📟 **Digital**: Beep eletrônico nítido.
  - ⚙️ **Mecânico**: Click clássico de metrônomo.
  - 🪵 **Madeira**: Som de woodblock natural.
- **Fórmula de Compasso**: Ajuste de 1 a 12 batidas por compasso.
- **Acento**: Opção para acentuar a primeira batida do compasso.
- **Tap Tempo**: Defina o BPM clicando no ritmo desejado.

### 🎯 Modo Treino (Novo!)
Um painel dedicado para estruturar seus estudos:
- **Timer de Sessão**: Defina um tempo de prática (1-60 min) com contagem regressiva.
- **Progressão Automática de BPM**:
  - Aumenta a velocidade gradualmente durante o treino.
  - Configurável: BPM Inicial, BPM Final, Intervalo de tempo e Incremento.
- **Estatísticas em Tempo Real**: Contador de compassos e tempo decorrido.

### 🎨 Interface e UX
- **Design Moderno**: Interface limpa com feedback visual pulsante.
- **Temas**:
  - 🌙 **Moderno**: Escuro, neon, futurista.
  - 🕰️ **Vintage**: Estilo clássico, madeira e tons de sépia.
- **Responsivo**: Funciona perfeitamente em desktop e mobile.
- **Visualizador de Batidas**: LEDs virtuais que indicam o tempo visualmente.

---

## 🛠️ Arquitetura e Tecnologias

O projeto segue uma arquitetura **Vanilla JS** orientada a objetos, sem dependências externas pesadas.

### Estrutura de Arquivos
```
metronome-app/
├── index.html      # Estrutura semântica e markup
├── style.css       # Estilos globais e temas (Moderno/Vintage)
├── training.css    # Estilos específicos do painel de treino
├── script.js       # Lógica da aplicação (Classe Metronome)
└── README.md       # Documentação do projeto
```

### Detalhes Técnicos

#### 1. Timing Preciso (Web Audio API)
Ao invés de confiar no `setInterval` do JavaScript (que é impreciso e sofre drift), utilizamos a abordagem **Lookahead Scheduling**:
- Um timer (`requestAnimationFrame` ou `setTimeout`) roda frequentemente para "olhar para o futuro".
- As notas são agendadas no buffer de áudio da Web Audio API com antecedência precisa.
- Isso garante que o som toque no momento exato, independente da carga da CPU.

#### 2. Lógica de Áudio
- **Osciladores**: Gerados em tempo real para os sons digitais e mecânicos.
- **Envelopes de Ganho**: Controlam o ataque e decaimento (ADSR simplificado) para moldar o timbre.
- **Frequências**: Ajustadas dinamicamente para criar acentos (batidas fortes vs fracas).

#### 3. Gerenciamento de Estado
A classe `Metronome` encapsula todo o estado da aplicação:
- `tempo`, `beatsPerBar`, `isPlaying` (Estado principal)
- `trainingMode` (Objeto com configurações e estado do modo treino)
- `audioContext` (Contexto de áudio único)

---

## 🚀 Como Usar

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/metronome-app.git
   ```

2. **Abra o projeto**:
   Basta abrir o arquivo `index.html` em qualquer navegador moderno. Não é necessário servidor backend ou build process.
   
   *Recomendação*: Use uma extensão como "Live Server" no VS Code para melhor experiência de desenvolvimento.

3. **Controles**:
   - **Espaço**: Iniciar/Parar.
   - **Setas Cima/Baixo**: Ajustar BPM em +/- 1.
   - **Clique no BPM**: Digitar valor diretamente (se implementado) ou usar o slider.

---

## 🧪 Desenvolvimento e Testes

Para modificar o projeto:

1. **CSS**:
   - `style.css` contém as variáveis CSS (`:root`) que controlam as cores dos temas.
   - Use as classes `.theme-vintage` para sobrescrever estilos no modo vintage.

2. **JavaScript**:
   - A lógica principal está no método `scheduler()` (agendamento) e `draw()` (visualização).
   - Novos recursos de áudio devem ser adicionados em `scheduleNote()`.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests para:
- Novos sons de metrônomo.
- Presets de ritmos complexos (polirritmia).
- Melhorias de acessibilidade.

---

## 📄 Licença

Este projeto é open-source e está disponível sob a licença MIT.
