$(document).ready(function() {
    const loginScreen = $('#login-screen');
    const chatScreen = $('#chat-screen');
    const nicknameInput = $('#nickname');
    const startChatButton = $('#start-chat');
    const avatars = $('.avatar');
    const chatMessages = $('#chat-messages');
    const messageInput = $('#message-input');
    const sendMessageButton = $('#send-message');
    const emojiButton = $('#emoji-button');
    const nudgeButton = $('#nudge-button');
    const drawButton = $('#draw-button');
    const typingIndicator = $('#typing-indicator');
    const statusSelector = $('#status-selector');
    const emoticonContainer = $('#emoticon-container');
    const drawingModal = $('#drawing-modal');
    const drawingCanvas = $('#drawing-canvas')[0];
    const ctx = drawingCanvas.getContext('2d');
    const colorPicker = $('#color-picker');
    const brushSize = $('#brush-size');
    const clearCanvasButton = $('#clear-canvas');
    const sendDrawingButton = $('#send-drawing');

    const messageSentSound = $('#message-sent')[0];
    const messageReceivedSound = $('#message-received')[0];
    const loginSound = $('#login-sound')[0];
    const nudgeSound = $('#nudge-sound')[0];

    let selectedAvatar = null;
    let userNickname = '';
    let isDrawing = false;

    const botNames = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Isabel', 'Jack'];
    const botAvatars = {};
    botNames.forEach(name => {
        botAvatars[name] = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
    });

    avatars.on('click', function() {
        avatars.removeClass('selected');
        $(this).addClass('selected');
        selectedAvatar = $(this).attr('src');
    });

    startChatButton.on('click', startChat);

    function startChat() {
        userNickname = nicknameInput.val().trim();
        if (userNickname && selectedAvatar) {
            loginScreen.hide();
            chatScreen.show();
            loginSound.play();
            initializeChat();
        } else {
            alert('Por favor, ingresa un nickname y selecciona un avatar.');
        }
    }

    function initializeChat() {
        setInterval(simulateBot, 5000);
        sendMessageButton.on('click', sendMessage);
        messageInput.on('keypress', function(e) {
            if (e.which == 13) {
                sendMessage();
            }
        });

        const picker = new EmojiButton();
        picker.on('emoji', emoji => {
            messageInput.val(messageInput.val() + emoji);
        });
        emojiButton.on('click', () => picker.togglePicker(emojiButton));

        nudgeButton.on('click', sendNudge);
        drawButton.on('click', openDrawingModal);

        initializeStatusSelector();
        initializeEmoticons();
        initializeDrawingCanvas();
    }

    function sendMessage() {
        const message = messageInput.val().trim();
        if (message) {
            addMessage(userNickname, message, selectedAvatar);
            messageInput.val('');
            messageSentSound.play();
        }
    }

    function addMessage(sender, message, avatar, isBot = false) {
        const messageElement = $('<div>').addClass('message d-flex align-items-start');
        if (isBot) {
            messageElement.addClass('bot-message');
        } else {
            messageElement.addClass('user-message');
        }
        messageElement.html(`
            <img src="${avatar}" alt="${sender}">
            <div>
                <strong>${sender}:</strong>
                <p>${message}</p>
            </div>
        `);
        chatMessages.append(messageElement);
        chatMessages.scrollTop(chatMessages[0].scrollHeight);
    }

    function simulateBot() {
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        const botAvatar = botAvatars[botName];
        simulateBotTyping(botName);
        setTimeout(() => {
            const botMessage = generateBotMessage();
            addMessage(botName, botMessage, botAvatar, true);
            messageReceivedSound.play();
        }, 2000);
    }

    function simulateBotTyping(botName) {
        typingIndicator.text(`${botName} está escribiendo...`);
        setTimeout(() => {
            typingIndicator.text('');
        }, 2000);
    }

    function generateBotMessage() {
        const phrases = [
            "¿Cómo va todo?",
            "Me encanta este chat",
            "¿Alguien quiere jugar un juego?",
            "¿Qué planes tienen para el fin de semana?",
            "Acabo de ver una película genial",
            "¿Alguna recomendación de música?",
            "Estoy aprendiendo a cocinar",
            "¿Cuál es su comida favorita?",
            "Me gustaría viajar pronto",
            "¿Alguien más está trabajando desde casa?"
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

    function sendNudge() {
        const nudgeMessage = $('<div>').addClass('system-message').text('Has enviado un zumbido');
        chatMessages.append(nudgeMessage);
        chatScreen.addClass('shake');
        nudgeSound.play();
        setTimeout(() => chatScreen.removeClass('shake'), 500);
    }

    function initializeStatusSelector() {
        const statuses = [
            { name: 'En línea', icon: 'status-online' },
            { name: 'Ausente', icon: 'status-away' },
            { name: 'Ocupado', icon: 'status-busy' },
            { name: 'Invisible', icon: 'status-invisible' }
        ];

        const select = $('<select>').addClass('form-select');
        statuses.forEach(status => {
            const option = $('<option>').val(status.name).text(status.name);
            select.append(option);
        });

        select.on('change', function() {
            const selectedStatus = $(this).val();
            const statusIcon = $('<span>').addClass('status-icon ' + statuses.find(s => s.name === selectedStatus).icon);
            statusSelector.find('.status-icon').remove();
            statusSelector.prepend(statusIcon);
        });

        statusSelector.append(select);
        select.trigger('change');
    }

    function initializeEmoticons() {
        const emoticons = [
            '😊', '😂', '😍', '🤔', '😎', '😢', '😡', '🤮', '🥳', '😴',
            '👍', '👎', '❤️', '💔', '🎉', '🌈', '🍕', '🍺', '🎵', '🚀'
        ];

        emoticons.forEach(emoticon => {
            const emoticonButton = $('<button>').addClass('btn btn-light emoticon-btn').text(emoticon);
            emoticonButton.on('click', function() {
                messageInput.val(messageInput.val() + emoticon);
            });
            emoticonContainer.append(emoticonButton);
        });
    }

    function initializeDrawingCanvas() {
        drawingCanvas.width = 400;
        drawingCanvas.height = 300;
        ctx.strokeStyle = colorPicker.val();
        ctx.lineWidth = brushSize.val();
        ctx.lineCap = 'round';

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        drawingCanvas.addEventListener('mousedown', startDrawing);
        drawingCanvas.addEventListener('mousemove', draw);
        drawingCanvas.addEventListener('mouseup', stopDrawing);
        drawingCanvas.addEventListener('mouseout', stopDrawing);

        colorPicker.on('change', () => ctx.strokeStyle = colorPicker.val());
        brushSize.on('input', () => ctx.lineWidth = brushSize.val());

        clearCanvasButton.on('click', () => {
            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        });

        sendDrawingButton.on('click', sendDrawing);

        function startDrawing(e) {
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }

        function draw(e) {
            if (!isDrawing) return;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            [lastX, lastY] = [e.offsetX, e.offsetY];
        }

        function stopDrawing() {
            isDrawing = false;
        }
    }

    function openDrawingModal() {
        drawingModal.css('display', 'block');
    }

    function sendDrawing() {
        const drawingUrl = drawingCanvas.toDataURL();
        const drawingImg = $('<img>').attr('src', drawingUrl).addClass('drawing-message');
        const messageElement = $('<div>').addClass('message user-message');
        messageElement.append(drawingImg);
        chatMessages.append(messageElement);
        chatMessages.scrollTop(chatMessages[0].scrollHeight);
        drawingModal.css('display', 'none');
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        messageSentSound.play();
    }

    // Cerrar el modal de dibujo si se hace clic fuera de él
    $(window).on('click', function(e) {
        if ($(e.target).is(drawingModal)) {
            drawingModal.css('display', 'none');
        }
    });
});